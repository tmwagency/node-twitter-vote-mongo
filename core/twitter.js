
/**
 * Handles the db setup - adds the questions to the database if not there already
 * and handles the db connection
 */

var express = require('express')
	, mongoose = require('mongoose')
	, io = require('socket.io') //socket.io - used for our websocket connection
	, client = require('socket.io-client')
	, twitter = require('twitter') //ntwitter - allows easy JS access to twitter API's - https://github.com/AvianFlu/ntwitter
	, _ = require('underscore')

	, Question = mongoose.model('Question')
	, State = mongoose.model('State')
	, state = require('../app/controllers/stateController')
	, page = require('../app/controllers/pageController')
	, pkg = require('../package.json');




module.exports = function (app, server, config) {

	//Start a Socket.IO listen
	var socketServer = io.listen(server);
	socketServer.set('log level', 1); //don't log all emits etc

	// Setup the socket.io client against our proxy
	//var ws = client.connect('ws://localhost:3001');

	// ws.on('message', function (msg) {
	// 	console.log(msg, 'HELLLLLLLO')
	// });

	//  ==================
	//  === ON CONNECT ===
	//  ==================

	//If a client connects, give them the current data that the server has tracked
	//so here that would be how many tweets of each type we have stored
	socketServer.sockets.on('connection', function(socket) {
		console.log('twitter.js: New connection logged');
		socket.emit('data', globalState.currentGlobalState);
	});

	//  ============================
	//  === SERVER ERROR LOGGING ===
	//  ============================

	socketServer.sockets.on('close', function(socket) {
		console.log('twitter.js: socketServer has closed');
	});

	//  ====================================
	//  === TWITTER CONNECTION TO STREAM ===
	//  ====================================

	//Instantiate the twitter component
	var t = new twitter(config.twitter);

	//  ===============================
	//  === State related function  ===
	//  ===============================
	var globalState = {

	}

	t.openStream = function () {
		console.log('twitter.js: Opening Stream');
		State.loadGlobalState(function (err, loadedGlobalState) {
			globalState.currentGlobalState = state.makeStateReadable(loadedGlobalState);

			t.createStream();
		});
	};
	t.createStream = function () {

		var tweet,
			tweetText;

		//console.log('twitter.js: ', globalState.currentGlobalState);

		//build stream of hashtags to watch for
		Question.getAllTags(function (tags) {

			globalState.tags = tags;
			//console.log('twitter.js: Watching tags: ', tags);

			//console.log(tags);

			//Tell the twitter API to filter on the watchSymbols
			t.stream('statuses/filter', { track: tags }, function(stream) {

				//We have a connection. Now watch the 'data' event for incomming tweets.
				stream.on('data', t.updateGlobalState);
				//catch any errors from the streaming API
				stream.on('error', function(error) {
					console.log("twitter.js: My error: ", error);

					//try reconnecting to twitter in 30 seconds
					setTimeout(function () {
						t.openStream();
					}, 30000);

				});
				stream.on('end', function (response) {
					// Handle a disconnection
					console.log("twitter.js: Disconnection: ", response.statusCode);

					//try reconnecting to twitter in 30 seconds
					setTimeout(function () {
						t.openStream();
					}, 30000);

				});
				stream.on('destroy', function (response) {
					// Handle a 'silent' disconnection from Twitter, no end/error event fired
					console.log("twitter.js: Destroyed: ", response);

					//try reconnecting to twitter in 30 seconds
					setTimeout(function () {
						t.openStream();
					}, 30000);
				});
			});
		});

		t.setupStateSaver();
	};

	//this function is called any time we receive some data from the twitter stream
	//we go through the tags, work out which one was mentioned, and then update the GlobalState
	t.updateGlobalState = function (data) {
		//console.log('twitter.js: receiving');

		//This variable is used to indicate whether a symbol was actually mentioned.
		//Since twitter doesnt know why the tweet was forwarded we have to search through the text
		//and determine which symbol it was meant for. Sometimes we can't tell, in which case we don't
		//want to increment the total counter...
		//console.log(data);

		//Make sure it was a valid tweet
		if (data.text !== undefined) {

			//We're gunna do some indexOf comparisons and we want it to be case agnostic.
			tweet = {
				symbol: null,
				time: null,
				text: data.text,
				country: ''
			},
			tweetText = data.text.toLowerCase();
			//console.log(tweetText);

			//Go through every symbol and see if it was mentioned. If so, increment its counter and
			//set the 'claimed' variable to true to indicate something was mentioned so we can increment
			//the 'total' counter!
			_.each(globalState.tags, function(symbol) {

				//check to see if we should be checking for nonHashTagged words or not
// 					if (isHashTag(symbol) && watchForNonHashTags) {

// 						//check for the hashtagged and non-hashtagged word
// 						if (text.indexOf(symbol.toLowerCase()) !== -1 || text.indexOf(symbol.substr(1).toLowerCase()) !== -1) {
// 							watchList.symbols[symbol].votes++;
// 							watchList.totalVotes++;
// 						}

// 					//else just check for the hashtag
// 					} else {

					if ((tweetText.toLowerCase()).indexOf(symbol.toLowerCase()) !== -1) {

						var shouldBeHashed = true;

						var isHashed = (symbol.substr(0, 1) === '#' ? true : false),
							nonHashed = symbol.substr(1),
							tagMatched = (isHashed || !shouldBeHashed ? symbol : '#' + symbol);

							//console.log(tagMatched);
						//console.log(symbol, tagMatched, isHashed, tweetText);
						t.matchQuestions(tagMatched);
					}

			});
			t.emitReadableState();
		}
	};

	//increment the count and the total count in our global state variable for the passed tag for the current day
	t.matchQuestions = function (tag) {

		//loop through each state object
		_.each(globalState.currentGlobalState, function(tempState, i) {

			//if the tag is in the list of tags that question is keeping a track of...
			if (_.contains(tempState.question.tags, tag)) {
				t.updateTag(tempState, tag);
			}
		});

	};

	//update the tags within the state
	t.updateTag = function (currentState, matchedTag) {

		//update total votes
		currentState.totalVotes = currentState.totalVotes + 1;
		//console.log('twitter.js: updateTag: ' + matchedTag);

		_.each(currentState.question.tags, function (tag, i) {

			//check if this is the active tag or one of the others
			var isActiveTag = (tag === matchedTag ? true : false);

			//if it's the matched tag, increment the votes it's received
			if (isActiveTag) {
				currentState.tagsData[tag].votes = currentState.tagsData[tag].votes + 1;
			}

			//then work out the percentage
			currentState.tagsData[tag].percentage = (currentState.tagsData[tag].votes / currentState.totalVotes) * 100;
		});

	};

	//we want to convert out state to an easier to read format for the javascript on the other side
	t.emitReadableState = function () {
		//emit our tweet
		socketServer.sockets.emit('tweet', globalState.currentGlobalState);
	};

	//updates the states in the DB every x seconds
	t.setupStateSaver = function () {
		//set to update every 10 seconds
		setInterval(function () {
			t.saveState(function (msg) {
				console.log(msg);
			});
		}, 10000);
	};

	t.saveState = function (cb) {
		state.updateAllStates(globalState.currentGlobalState, cb);
	};


	return t;

};



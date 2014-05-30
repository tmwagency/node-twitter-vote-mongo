
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')

	, State = mongoose.model('State')
	, utils = require('../../lib/utils')
	, _ = require('underscore');



/**
 * Create a question
 */

exports.create = function (q, cb) {

	var now = new Date(),
		today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

	var state = new State({
		question				:	q._id,
		date					:	today,
		totalVotes				:	0
	});

	_.each(q.tags, function(tag) {
		state.tags.push({
			tag: tag,
			votes: 0,
			percentage: 0
		});
	});

	state.save(cb);

}


/**
 * Make state a more readable format than how it comes back from the DB
 */

exports.makeStateReadable = function (states) {

	//console.log('stateController: makeStateReadable')

	var readableStates = {};

	for (var stateNum in states) {

		var state = states[stateNum],
			QID = state.question.questionURL;

		readableStates[QID] = {
			question : states[stateNum].question,
			tagsData : {},
			totalVotes : state.totalVotes,
			date : state.date
		};


		//loop through each tag
		_.each(state.tags, function (tag, j) {
			readableStates[QID].tagsData[tag.tag] = tag;
		});
	}

	//state
	return readableStates;

}


exports.updateAllStates = function (globalState, cb) {

	//console.log('stateController: updateAllStates');
	var controller = this,
		stateSavedCounter = 0,
		stateLength = Object.keys(globalState).length;

	for (var state in globalState) {

		loadState(globalState[state]);

	}


	//function created to create a closure around relevantState so we can pass it through once our callback is executed
	function loadState(relevantQuestion) {
		//load the state of the same id
		State.load(relevantQuestion.question._id, 'today', function (err, currentState) {

			//should do something here to handle when the day changes - at the moment it errors out (which is fine) and restarts server, would be better if was more seamless and handled it here
			if (err === null) {
				controller.updateState(relevantQuestion, currentState, function() {
					stateSavedCounter++;

					if (stateSavedCounter === stateLength) {
						cb('All states saved');
					}
				});
			}

		});
	}


}

exports.updateState = function (newState, currentState, cb) {

	//update with the current state with the new state values

	currentState.totalVotes = newState.totalVotes;

	//loop through tags and update
	for (var i=0; i < currentState.tags.length; i++) {
		var tagState = currentState.tags[i],
			tagId = tagState.tag,
			newTagState = newState.tagsData[tagId];

		//update values
		tagState.votes = newTagState.votes;
		tagState.percentage = newTagState.percentage;
	}

	//and then save back to the db
	currentState.save(
		function (err, product, numAffected) {
			if (err !== null) {
				console.log(err);
			} else {
				console.log('Successfully updated DB: ', newState.question.questionURL, newState.totalVotes);
			}
			cb();
		}
	);

}





var mongoose = require('mongoose')

	, question = require('../../app/controllers/questionController')
	, state = require('../../app/controllers/stateController')

	, Question = mongoose.model('Question')
	, State = mongoose.model('State')
	, utils = require('../../lib/utils')
	, _ = require('underscore');


exports.createQuestions = function(twitter, cb) {

	var rawQuestionsJSON = require('../../core/questions');

	//get the length of our question json
	var rawQuestionsJSONLength = Object.keys(rawQuestionsJSON).length;

	//console.log('pageController: getRawQuestionData: length ' + rawQuestionsJSONLength);
	var _this = this,
		questionsCreated = 0;


	//now loop through the JSON array and check each question has been created
	_.each(rawQuestionsJSON, function (rawQuestion, i) {

		question.create(rawQuestion, function (err) {

			if (err) {
				console.log('pageController: create: ' + err + ': Question not saved');
			} else {
				console.log('pageController: create: Question saved to collection');
			}
			questionsCreated++;

			console.log(questionsCreated);

			//if we have reached the end of our questions, call our callback
			//which in this case checks the states, and then opens our twitter stream
			if (questionsCreated === rawQuestionsJSONLength) {

				cb(_this, twitter.openStream);
			}

		});
	}, this);

};


exports.createStates = function (page, cb) {

	console.log('pageController: createStates: Creating States');

	var stateCheckCounter = 0;

	//first get all the questions
	Question.loadAll(function (err, questions) {

		var questionsLength = questions.length;

		console.log('pageController: createStates: ' + questionsLength);

		questions.forEach(function (q) {
			page.getState(q, function (state) {
				stateCheckCounter++;

				if (stateCheckCounter === questionsLength) {
					cb();
				}
			});
		});
	});
};

exports.getState = function (question, cb) {

	console.log('pageController: getState: Getting state');
	//console.log(question.tags);

	State.load(question._id, 'today', function (err, pageState) {
		//if we can find state, great
		if (pageState) {
			console.log('pageController: getState: State found');
			cb(pageState);

		//else create a state in the DB and set to zero
		} else {
			console.log('pageController: getState: State not found, so creating state myself', question.questionURL);


			state.create(question, function (err) {

				if (err) {
					console.log('pageController: getState: ' + err + ': state not saved\n');
				} else {
					console.log('pageController: getState: State saved to collection\n');
				}

				cb(state);

			});
		}
	});

};


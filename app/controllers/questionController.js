
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')

	, page = require('../../app/controllers/pageController')
	, Question = mongoose.model('Question')
	, utils = require('../../lib/utils')
	, _ = require('underscore');



/**
 * Load
 */

exports.load = function (req, res, next, id) {
	console.log('questionController: Loading question from DB');

	Question.load(id, function (err, question) {
		if (err) return next(err)
		if (!question) return next(new Error('not found'))
		req.question = question
		next()
	})
};

/**
 * Create a question
 */

exports.create = function (q, cb) {

	//first we need to check if the question already exists in the DB - we don't want duplicates
	Question.load(q.qURL, function (err, question) {

		//if we can't find an id of the same name, it's not in the DB so add it
		if (!question) {

			if (q.isActive === 'undefined') {
				q.isActive = false;
			}

			var question = new Question({
				questionURL			:	q.qURL,
				title				:	q.title,
				subtitle			:	q.subtitle,
				watchForNonHashTags	:	q.watchForNonHashTags,

				tags				:	q.tags,

				twitterText			:	q.twitterText,
				isActive			:	q.isActive
			});

			question.save(cb);
		} else {
			//check we don't need to update it with new potential new values if our array has changed
			//
			// THIS LOGIC GOES IN HERE
			//
			cb('Question already exists in collection')
		}
	});

};

/**
 * Display
 */

exports.display = function(req, res) {

	console.log('questionController: Displaying page:');

	qController = this;

	//load our question
	Question.load('catdog', function (err, question) {

		//if we can't find an id of the same name, it's not in the DB so add it
		if (question) {

			page.getState(question, function (state) {
				//reduce tags into associated array
				var tags = _.reduce (state.tags, function (reduced, item) {
					reduced[item.tag] = item;
					return reduced;
				}, {});

				res.render('layouts/question', {
					question: question,
					state: state,
					tags: tags
				});

			});
		} else {
			console.log ('Question not found to display');
		}
	});



};




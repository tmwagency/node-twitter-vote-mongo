
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

exports.load = function(req, res, next, id){
	console.log('questionController: Loading questions from DB');

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
			cb('Question already exists in collection')
		}

		//
	});

};

/**
 * Display
 */

exports.display = function(req, res) {

	console.log('questionController: Displaying page:');
	//console.log(req.question);

	page.getState(req.question, function (state) {
		//console.log(state);
		//reduce tags into associated array
		var tags = _.reduce (state.tags, function (reduced, item) {
			reduced[item.tag] = item;
			return reduced;
		}, {});

		res.render('layouts/question', {
			question: req.question,
			state: state,
			tags: tags
		});
	});


	//want state to be
	//state['#happy'].votes = 20;

	//get current values for each total
	// for (var i = 0; i < (req.question.tags).length; i++) {
	// 	console.log(req.question.tags[i]);

	// 	state.(req.question.tags[i]) = {
	// 		votes: QDT.getCount,
	// 		percentage: QDT.getPercentage
	// 	}
	// }


};


exports.about = function(req, res){

	//display list of all the questions for our index page
	console.log('questionController: About page');

	//console.log(questions);

	res.render('about'/*, {
		title: '#MassDebates',
		questionsJSON: questions
	}*/);

}


/**
 * List
 */

exports.index = function(req, res){

	//display list of all the questions for our index page
	console.log('questionController: index');

	Question.loadAll(function (err, questions) {

		//console.log(questions);

		res.render('index', {
			title: 'Twitter Vote Counter',
			questionsJSON: questions
		});

	});

}


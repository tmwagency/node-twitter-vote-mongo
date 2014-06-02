
/*!
 * Module dependencies.
 */

var async = require('async')

/**
 * Controllers
 */

var question = require('../app/controllers/questionController')

/**
 * Expose routes
 */

module.exports = function (app, twitter) {

	app.get('/', question.display);

	//for the url /lynx-fragrance-poll call display method with param 1
	// app.get('/question/:name', question.display);

	// app.param('name', question.load);


	// assume "not found" in the error msgs
	// is a 404. this is somewhat silly, but
	// valid, you can do whatever you like, set
	// properties, use instanceof etc.
	app.use(function(err, req, res, next){
		// treat as 404
		if (err.message
			&& (~err.message.indexOf('not found')
			|| (~err.message.indexOf('Cast to ObjectId failed')))) {
			return next();
		}

		// log it
		// send emails if you want
		console.error(err.stack);

		// error page
		res.status(500).render('500', { error: err.stack });
	});

	// assume 404 since no middleware responded
	app.use(function(req, res, next){
		res.status(404).render('404', {
			url: req.originalUrl,
			error: 'Not found'
		});
	});

}

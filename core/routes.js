
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

module.exports = function (app) {

	app.get('/', question.index);

	app.get('/about', question.about);

	//for the url /lynx-fragrance-poll call display method with param 1
	app.get('/question/:name', question.display);

	app.param('name', question.load);



	// app.get('/auth/twitter',
	//   passport.authenticate('twitter', {
	//     failureRedirect: '/login'
	//   }), users.signin)
	// app.get('/auth/twitter/callback',
	//   passport.authenticate('twitter', {
	//     failureRedirect: '/login'
	//   }), users.authCallback)

	// home route
	//app.get('/', questions.index)

}

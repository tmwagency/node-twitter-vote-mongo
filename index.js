/**
 * Module dependencies.
 */
var express = require('express')
 	, fs = require('fs')
	, http = require('http')
	, _ = require('underscore') //underscore - some extra JS sugar
	, path = require('path'); //http://nodejs.org/docs/v0.4.9/api/path.html


/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

var env = process.env.NODE_ENV || 'local'	//get the environemnt var or set as development
	, config = require('./config/config')[env]	//get config based on the specifed environment
	, mongoose = require('mongoose');			//require mongoose for added mongodb sugar


console.log('ENVIRONMENT = ' + env);

//  ================================
//  === EXPRESS SETUP AND CONFIG ===
//  ================================

//Create an express app
var app = express();

// express settings
require('./core/express')(app, config);


//Create the HTTP server with the express app as an argument
var server = http.createServer(app);

//Create the server
server.listen(app.get('port'), function(){
	console.log('app.js: Express server listening on port ' + app.get('port'));
});
server.on('close', function(socket) {
	console.log('app.js: Server has closed');
});


// Bootstrap models
var models_path = __dirname + '/app/models'
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file)
})

var twitter = require('./core/twitter')(app, server, config);

//bootstrap the database stuff
var db = require('./core/db')(app, twitter, config);


// Bootstrap routes
require('./core/routes')(app, twitter);




// expose app
exports = module.exports = app;



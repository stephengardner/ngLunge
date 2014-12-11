/**
 * Main application file
 */
'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var util = require('util');
var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment'),
	autoIncrement = require('mongoose-auto-increment'),
	bodyParser = require('body-parser'),
	busboy = require('connect-busboy'),
	fs = require('fs'),
	connect = require('connect'),
	//session = require('express-session'),
	//MongoStore = require('connect-mongo')(session),
	cookieParser = require('cookie-parser'),
	events = require('events'),
	passport = require("passport");
	//passportSocketIo = require("passport.socketio");

var app = express();

// Setup server
var server = require('http').createServer(app);
// Connect to database
var connection = mongoose.connect(config.mongo.uri, config.mongo.options);
autoIncrement.initialize(connection);
/*
var MStore = new MongoStore({
	url: config.mongo.uri
});
*/

app.use(cookieParser());

 // set up sessions
/*
 app.use(session({
 key: 'connect.sid',
 secret : config.secrets.session,
 store : MStore
 }))
*/
// initialize passport and set sessions
//app.use(passport.initialize());
//app.use(passport.session());

// body parsing middleware
app.use(bodyParser.json({uploadDir:'./uploads'}));
app.use(bodyParser.urlencoded({
	extended: true,
	uploadDir:'./uploads'
}));
app.use(busboy());

// Populate DB with sample data
if(config.seedDB) { require('./config/seed'); }

// Hook socket.io
var socketio = require('socket.io')(server, {
	serveClient: (config.env === 'production') ? false : true
	, path: '/socket.io-client'
});

// create a MongoStore for session storage

// Start server
server.listen(config.port, config.ip, function () {
	console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Custom events
function MyEmitter () {
	events.EventEmitter.call(this);
}
util.inherits(MyEmitter, events.EventEmitter);
app.e = new MyEmitter;

// Expose app
exports = module.exports = app;

// Configurations
require('./config/socketio')(socketio);
require('./config/express')(app);
require('./routes')(app);

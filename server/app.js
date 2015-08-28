/**
 * Main application file
 */
'use strict';

/*
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
	session = require('express-session'),
	MongoStore = require('connect-mongo')(session),
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

var MStore = new MongoStore({
	url: config.mongo.uri
});


app.use(cookieParser());

 // set up sessions

 app.use(session({
	 key: 'connect.sid',
	 secret : config.secrets.session,
	 resave : true,
	 saveUninitialized : true,
	 store : MStore
 }))

// initialize passport and set sessions
app.use(passport.initialize());
app.use(passport.session());

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

app.socketio = socketio;
app.sockets = {};
var socketioJwt = require('socketio-jwt');
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

require('./config/socketio')(socketio, server);
// Configurations
require('./config/express')(app);
require('./routes')(app);
var $q = require('q');
var GoogleMapApi = require('googlemaps');
var util = require('util');
var Geocoder = require('./components/geocoder')($q, GoogleMapApi);
var Trainer = require("./api/trainer/trainer.model");
var LocationProcessor = require("./components/location-processor/index.js")();
Trainer.findOne({email : "opensourceaugie@gmail.com"}).exec(function(err, trainer){
	LocationProcessor.parseTrainer(trainer).then(function(){
	}).catch(function(err){
		console.log(err);
	})
});
*/

require("./server.js");
/*
console.log("\n\n\n--------------------------------------------------\nGeocoder:");

Geocoder.init().then(function(){
	Geocoder.geocodeObjectAddress({address_line_1 : "17501 country view way", city : "ashton"});
});

console.log("\n\n\n--------------------------------------------------\nGeocoder:");
*/

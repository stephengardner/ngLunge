/**
 *
 * Main application file
 * I previously thought this might cache the app.listen part so that mocha could run concurrently with the regular
 * server, but that's not the case.
 *
 */

'use strict';

// make sure there is a NODE_ENV var
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var logger = require('./components/logger')();
var config = require('./config/environment');
var EventEmitter = require('events').EventEmitter;
var architect = require("architect");

function App(config) {
	this.config = config;
}
App.prototype = Object.create(EventEmitter.prototype);

config.handleQueues = false;
config.handleServer = true;

var tree = require("./app_v2/architect/main-app")(config);
architect.createApp(tree, function(err, Architect){
	logger.info("-------------- have created app.js ");
	if(err) {logger.error(err);}
	else {onReady(Architect);}
});

function onReady(Architect){
	app.emit('ready', Architect);
}
var app = new App();

// expose the app
module.exports = app;

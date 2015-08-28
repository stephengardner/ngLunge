'use strict';

var connections = require("./connections"),
	EventEmitter = require('events').EventEmitter,
	_ = require('lodash'),
	logger = require("../components/logger")();
var Promise = require("promise");

// load extra prototype functions for all of JS
//require('./extra-object-functions');

// define App Queue Types
//var QUEUE_TYPES = require('./queue-types');

/**
 * @param config
 * @constructor
 */
function App(config) {
	EventEmitter.call(this);
	this.config = config;
	logger.info("Attempting to connect to mongo uri:", config.mongo.uri);
	logger.info("Attempting to connect to rabbit url:", config.rabbit_url);
	this.connections = connections(config.mongo.uri, config.rabbit_url);
	this.connections.once('ready', this.onConnected.bind(this));
	this.connections.once('lost', this.onLost.bind(this));
}


// Merge all events etc for this App instance
/*
App.prototype = _.extend(
	App.prototype,
	EventEmitter.prototype
	//,require('./events/connection')
);
*/
App.prototype = Object.create(EventEmitter.prototype);
App.prototype.onConnected = function(){
	console.log('==========> app.onConnected!');
	// set the models for the app instance
	this.setModels();
	console.log(" [x] Context is ready ");
	this.onReady();
};

App.prototype.onLost = function() {
	console.log(' [xxx] app.lost');
	this.emit('lost');
};

App.prototype.onReady =function() {
	console.log(' [x] app.ready');
	this.emit('ready');
};

App.prototype.setModels = function() {
		logger.info("*** ---------------> app setModels()");
		this.models = {
			Trainer : require("./models/trainer/trainer.model")(this),
			Registration : require("./models/registration/registration.model")(this),
			Certification : require("./models/certification/certification.model")(this),
			CertificationType : require("./models/certification-type/certification-type.model")(this),
			Activity : require("./models/activity/activity.model")(this),
			Specialty : require("./models/specialty/specialty.model")(this)
		}
};

module.exports = function createApp(config) {
	logger.verbose("server/app/index.js: createApp()");
	return new App(config);
};
var mongoose = require('mongoose');
var jackrabbit = require('jackrabbit');
//var logger = require('../../components/logger')();
var EventEmitter = require('events').EventEmitter;
var autoIncrement = require('mongoose-auto-increment');
var config = require("../../config/environment");
var logger = require("../../components/logger")();
var rabbitjs = require("rabbit.js");


// Connector creates a this.db object and a this.queue object on the resulting App instance
function Connector(mongoUrl, rabbitUrl) {
	EventEmitter.call(this);

	var self = this;
	var readyCount = 0;

	// https://github.com/heroku-examples/node-articles-nlp
	// createConnection is the way to go when you want to be able to have multiple DB connections on one node project
	//mongoose.connect(mongoUrl, config.mongo.options);

	console.log("connecting to url:", mongoUrl);
	this.db = mongoose.createConnection(mongoUrl);
	this.db.on('connected', function() {
		ready();
	})
	this.db.on('error', function(err) {
		logger.info({ type: 'error', msg: err, service: 'mongodb' });
	})
	this.db.on('close', function(str) {
		logger.info({ type: 'error', msg: 'closed', service: 'mongodb' });
	})
	this.db.on('disconnected', function() {
		logger.info({ type: 'error', msg: 'disconnected', service: 'mongodb' });
		lost();
	});
	autoIncrement.initialize(this.db);

	// seed the db if necessary
	if(config.seedDB) { require('../../config/seed'); }

	function ready() {
		if (++readyCount === 1) {
			logger.info("Emitting Ready from connections/index.js");
			self.emit('ready');
		}
	}

	function lost() {
		self.emit('lost');
	}
};

Connector.prototype = Object.create(EventEmitter.prototype);

Connector.prototype.on("error", function(err){
	logger.error(err)
});

Connector.prototype.on("unhandledException", function(err){
	logger.error(err);
});

module.exports = function(mongoUrl, rabbitUrl) {
	return new Connector(mongoUrl, rabbitUrl);
};
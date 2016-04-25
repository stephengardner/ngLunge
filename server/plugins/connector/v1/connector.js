var mongoose = require('mongoose');
var logger = require("../../../components/logger")();
var EventEmitter = require('events').EventEmitter;
var autoIncrement = require('mongoose-auto-increment');
var jackrabbit = require('jackrabbit');

module.exports = function setup(options, imports, register){
	register(null, {
		connector : {
			connect : function(mongoUrl, rabbitUrl){
				return new Connector(mongoUrl, rabbitUrl);
			}
		}
	})
}

function Connector(mongoUrl, rabbitUrl) {
	EventEmitter.call(this);

	var self = this;
	var readyCount = 0;
	var necessaryReadyCount = rabbitUrl ? 3 : 1;

	// https://github.com/heroku-examples/node-articles-nlp
	// createConnection is the way to go when you want to be able to have multiple DB connections on one node project
	//mongoose.connect(mongoUrl, config.mongo.options);
	this.db = mongoose.createConnection(mongoUrl)
		//this.db = mongoose.connection
		.on('connected', function() {
			logger.info({ type: 'info', msg: 'connected', service: 'mongodb' });
			ready();
		})
		.on('error', function(err) {
			logger.info({ type: 'error', msg: err, service: 'mongodb' });
		})
		.on('close', function(str) {
			logger.info({ type: 'error', msg: 'closed', service: 'mongodb' });
		})
		.on('disconnected', function() {
			logger.info({ type: 'error', msg: 'disconnected', service: 'mongodb' });
			lost();
		});

	// initialize auto increment
	autoIncrement.initialize(this.db);

	// seed the db if necessary
	//if(config && config.seedDB) { require('../../config/seed'); }

	if(rabbitUrl){
		this.queue = jackrabbit(rabbitUrl)
			.on('connected', function() {
				logger.info({ type: 'info', msg: 'connected', service: 'rabbitmq' });
				ready();
			})
			.on('error', function(err) {
				logger.error({ type: 'error', msg: err, service: 'rabbitmq' });
			})
			.on('disconnected', function() {
				logger.info({ type: 'error', msg: 'disconnected', service: 'rabbitmq' });
				lost();
			});

		this.rabbitjscontext = require("rabbit.js").createContext(rabbitUrl);
		console.log(" [x] Created context %s", rabbitUrl);

		this.rabbitjsqueues = {
			push : {},
			worker : {}
		};

		this.rabbitjscontext.on('ready', function() {
			logger.info({type: 'info', msg: 'connected', service: '-rabbit.js context'});
			ready();
		})
			.on('error', function(err) {
				logger.info({ type: 'error', msg: err, service: 'rabbitjs context' });
			});
	}

	function ready() {
		if (++readyCount === necessaryReadyCount) {
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
})
Connector.prototype.on("unhandledException", function(err){
	logger.error(err);
})
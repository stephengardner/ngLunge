var mongoose = require('mongoose');
var autoIncrement = require("mongoose-auto-increment");

module.exports = function setup(options, imports, register) {
	// only connect to the database.
	var logger = imports.logger.info,
		config = options.config;

	var dbConnection = mongoose.createConnection(config.mongo.uri)
		//this.db = mongoose.connection
		.on('connected', function() {
			logger.info({ type: 'info', msg: 'connected', service: 'mongodb' });
			ready(dbConnection);
		})
		.on('error', function(err) {
			logger.info({ type: 'error', msg: err, service: 'mongodb' });
		})
		.on('close', function(str) {
			logger.info({ type: 'error', msg: 'closed', service: 'mongodb' });
		})
		.on('disconnected', function() {
			logger.info({ type: 'error', msg: 'disconnected', service: 'mongodb' });
		});

	function ready(dbConnection) {
		console.log("Database ready!\n");
		autoIncrement.initialize(dbConnection);
		register(null, {
			connectionDatabase : dbConnection
		})
	}
}
var http = require("http");
//var web = require("../../../web");
//var logger = require("../../../components/logger")();
EventEmitter = require('events').EventEmitter;
var _ = require("lodash");

var express = require('express');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var path = require('path');
var config = require('../../../config/environment');
var passport = require('passport');
var session = require('express-session');

var mongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');

module.exports = function setup(options, imports, register) {
	var connectionDatabase = imports.connectionDatabase;
	var config = options.config;
	var logger = imports.logger.info;
	;

	function App(config) {
		this.config = config;
		//this.connections = connections;
		//this.amqp = amqp;
	}

	App.prototype = Object.create(EventEmitter.prototype);

	var instance = new App(config);
	_.merge(instance, imports.models);
	//setModels(instance);
	if(options.server) {
		createServer(instance, config);
	}
	else {
		register(null, {
			app : instance
		})
	}


//	bus.on('architect-ready', function(Architect){
//	instancep.emit('ready, Architect');
//	})

	function createServer(instance, config) {
		logger.info("appv2 lunge: createServer()");
		process.on('SIGTERM', shutdown);
		//var web = express();
		imports.web;
		instance.web = web;

		var server = http.createServer(web, config);
		//if(!module.parent){
		console.log("Attempting to listen on port:" + config.port);
			server.listen(config.port, config.ip, onListen);
		//}

		instance.server = server;
		instance
			.removeListener('lost', abort)
			.on('lost', shutdown);

		function onListen() {
			logger.info({type: 'info', msg: 'appv2 plugin listening', port: server.address().port});
			//configSocketIO();
			register(null, {
				app : instance
			})
		}

		//function configSocketIO() {
		//	// set up socketio now that the server has been created
		//	var socketio = require('socket.io')(server, {
		//		serveClient: (config.env === 'production') ? false : true,
		//		path: '/socket.io-client',
		//		transports: ['websocket']  // On PAAS ( Heroku ) we can only use the websocket transport
		//	});
		//	require('../../../config/socketio')(socketio);
		//}

		function shutdown() {
			logger.log({type: 'info', msg: 'appv2 plugin shutting down'});
			server.close(function () {
				logger.log({type: 'info', msg: 'exiting'});
				process.exit();
			});
		}
	}

}

function abort() {
	logger.info("Lunge: abort()");
	logger.log({ type: 'info', msg: 'appv2 plugin shutting down', abort: true });
	process.exit();
}
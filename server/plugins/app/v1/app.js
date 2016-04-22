var http = require("http");
var web = require("../../../web");
var logger = require("../../../components/logger")();
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
	var connections = imports.connections,
		config = options.config,
		bus = imports.eventbus,
		models = imports.models,
		amqp = imports.amqp,
		expressConfig = imports.expressConfig,
		routesConfig = imports.routesConfig
	;

	function App(config) {
		this.config = config;
		this.connections = connections;
		this.amqp = amqp;
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


	// Let the console know which app (worker/clock/web) is handling the queue
	bus.on('amqp-subscribed', function(){
		console.log("----------> This app is handling queue tasks <------------");
	});

	amqp.init(connections.queue).then(function(){
		logger.info("Emitting amqp-ready");
		bus.emit('amqp-ready');
		if(options.handleQueues) {
			amqp.subscribe.all().then(function(){
				logger.info("Emitting amqp-subscribed");
				bus.emit('amqp-subscribed');
			}).catch(logger.error);
		}
	}).catch(logger.error);

//	bus.on('architect-ready', function(Architect){
//	instancep.emit('ready, Architect');
//	})

	function createServer(instance, config) {
		logger.info("appv2 Apartminty: createServer()");
		process.on('SIGTERM', shutdown);
		var web = express();
		expressConfig.configure(web);
		routesConfig.configure(web);
		//web.use('/api/property-lead', imports.apiPropertyLeadRouter);
		//web.use('/api/yardi', imports.apiYardiRouter);
		//web.use('/api/users', imports.apiUserRouter);
		//web.use('/api/primeline-activities', imports.apiPrimelineActivityRouter);
		//web.use('/api/properties-v2', imports.apiPropertyV2Router);
		//web.use('/api/feeds', imports.apiFeedRouter);
		//web.use('/api/emails', imports.apiEmailRouter);
		//web.use('/api/apartment_sizes', imports.apiApartmentSizeRouter);
		//web.use('/api/email-search-results', imports.apiEmailSearchResultsRouter);
		//web.use('/auth', imports.authRoutes);
		//web.use('/api/geolocation', imports.apiGeolocationRouter);


		//var web = imports.web;
		//var webConfig = imports.webConfig;

		//webConfig.configExpress(instance)
		// Configure the new routes first, because the old routes will then reroute anything that doesn't match them
		//webConfig.configNewRoutes();
		//webConfig.configOldRoutes(instance);

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
			configSocketIO();
			register(null, {
				app : instance
			})
		}

		function configSocketIO() {
			// set up socketio now that the server has been created
			var socketio = require('socket.io')(server, {
				serveClient: (config.env === 'production') ? false : true,
				path: '/socket.io-client',
				transports: ['websocket']  // On PAAS ( Heroku ) we can only use the websocket transport
			});
			require('../../../config/socketio')(socketio);
		}

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
	logger.info("Apartminty: abort()");
	logger.log({ type: 'info', msg: 'appv2 plugin shutting down', abort: true });
	process.exit();
}
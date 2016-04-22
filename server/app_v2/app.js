var http = require("http");
var web = require("../web");
var logger = require("../components/logger")();
EventEmitter = require('events').EventEmitter;


module.exports = function setup(options, imports, register) {
	var connections = imports.connections,
		config = options.config,
		bus = imports.eventbus,
		models = imports.models,
		amqp = imports.amqp;

	function App(config) {
		this.config = config;
		this.connections = connections;
		this.amqp = amqp;
	}

	App.prototype = Object.create(EventEmitter.prototype);

	var instance = new App(config);
	setModels(instance);
	if(options.server) {createServer(instance, config);}

	// Let the console know which app (worker/clock/web) is handling the queue
	bus.on('amqp-subscribed', function(){
		console.log("----------> This app is handling queue tasks <------------");
	});

	amqp.init(connections.queue).then(function(){
		bus.emit('amqp-ready');
		if(options.handleQueues) {
			amqp.subscribe.all().then(function(){
				bus.emit('amqp-subscribed');
			}).catch(logger);
		}
	}).catch(logger);

	/*
	bus.on('architect-ready', function(Architect){
		// if we want this app to handle the queues then intitalize them here.
		// in this case, every app has an AMQP dependency but not every app uses it
		if(options.handleQueues) {
			var amqp = Architect.services.amqp;
			amqp.subscribe.all().then(function(){
				bus.emit('amqp-subscribed');
			}).catch(logger);
		}
	});
	*/

	register(null, {
		app : instance
	})
	/*
	onFinally();
	function onFinally() {
		register(null, {
			app : instance
		})
	}
	*/
};


function setModels(instance) {
	logger.info("*** ---------------> app setModels()");
	instance.ApartmentSize = require('../app/models/apartment_size/apartment_size.model.js')(instance);
	instance.User = require('../app/models/user/user.model.js')(instance);
	instance.Property = require('../app/models/property/property.model.js')(instance);
	instance.PropertyV2 = require('../app/models/property_v2/property-v2.model.js')(instance);
	instance.PropertyNew = require('../app/models/property_new/property-new.model.js')(instance);
	instance.PropertyMerged = require('../app/models/property_merged/property-merged.model.js')(instance);
	instance.Feed = require('../app/models/feed/feed.model.js')(instance);
	instance.Email = require('../app/models/email/email.model.js')(instance);
	instance.PropertyLead = require('../app/models/property_lead/property-lead.model.js')(instance);
	instance.Amenity = require('../app/models/amenity/amenity.model.js')(instance);
	instance.EmailSearchResults = require('../app/models/email_search_results/email-search-results.model.js')(instance);
	instance.Primeline = require("../primeline")(instance);
	// New primeline - testing...
	//this.PrimelineV2 = require("../primeline_v2")(this);
	instance.UnitUpdater = require("../components/updaters/unit-updater")(instance);
	instance.FeedUpdater = require("../components/updaters/feed-updater")(instance);
	instance.components = {
		email : require("../components/email/index.js")(instance),
		PrimelineActivity : require("../components/primeline_activity")(instance)
	};
	instance.models = {
		PrimelineActivity : require("../app/models/primeline_activity/primeline-activity.model.js")(instance)
	}
}


function createServer(instance, config) {
	logger.info("appv2 Apartminty: createServer()");
	process.on('SIGTERM', shutdown);
	var server = http.createServer(web(instance), config)
		.listen(config.port, config.ip, onListen);
	instance
		.removeListener('lost', abort)
		.on('lost', shutdown);

	function onListen() {
		logger.info({ type: 'info', msg: 'appv2 plugin listening', port: server.address().port });
		configSocketIO();
	}

	function configSocketIO() {
		// set up socketio now that the server has been created
		var socketio = require('socket.io')(server, {
			serveClient: (config.env === 'production') ? false : true,
			path: '/socket.io-client',
			transports : ['websocket']  // On PAAS ( Heroku ) we can only use the websocket transport
		});
		require('../config/socketio')(socketio);
	}

	function shutdown() {
		logger.log({ type: 'info', msg: 'appv2 plugin shutting down' });
		server.close(function() {
			logger.log({ type: 'info', msg: 'exiting' });
			process.exit();
		});
	}
}

function abort() {
	logger.info("Apartminty: abort()");
	logger.log({ type: 'info', msg: 'appv2 plugin shutting down', abort: true });
	process.exit();
}
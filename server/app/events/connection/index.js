var logger = require('../../../components/logger')();
var _ = require('lodash');

function setModels() {
}
var mergedPrototype = {
	onConnected : function() {
		logger.info('==========> app.onConnected!');

		// set the models for the app instance
		this.setModels();

		var self = this;

		console.log(" [x] Context is ready ");
		//this.rabbitjsfactory.context = this.connections.rabbitjscontext;

		// note - not calling attachRabbitJS() until after everything (in worker.js), because rabbit.js will make the
		// web process\interfere with the worker process, and the messages will never get sent until the wbe process dies.
		//this.attachJackrabbit();
		this.onReady();
	},

	onJackrabbitAttached : function() {
		logger.info(' [x] jackrabbit module attached');
		this.onReady();
	},

	onRabbitJSAttached : function() {
		logger.info(' [x] rabbitjs module attached');
		this.emit('rabbitjs-attached');
	},

	onReady : function() {
		logger.info(' [x] app.ready');
		this.emit('ready');
	},

	onLost : function() {
		logger.info(' [xxx] app.lost');
		this.emit('lost');
	}
};

module.exports = mergedPrototype;
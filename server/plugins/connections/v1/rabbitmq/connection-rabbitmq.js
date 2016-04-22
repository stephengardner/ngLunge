var jackrabbit = require('jackrabbit');

module.exports = function setup(options, imports, register) {
	var config = options.config;
	var rabbitUrl = config.rabbit_url;
	var logger = imports.logger.info;
	var readyCount = 0;

	var queue = jackrabbit(rabbitUrl)
		.on('connected', function() {
			logger.info({ type: 'info', msg: 'connected', service: 'rabbitmq' });
			ready();
		})
		.on('error', function(err) {
			logger.error({ type: 'error', msg: err, service: 'rabbitmq' });
		})
		.on('disconnected', function() {
			logger.info({ type: 'error', msg: 'disconnected', service: 'rabbitmq' });
		});

	var rabbitjscontext = require("rabbit.js").createContext(rabbitUrl);
	console.log(" [x] Created context %s", rabbitUrl);


	rabbitjscontext.on('ready', function() {
		logger.info({type: 'info', msg: 'connected', service: '-rabbit.js context'});
		ready();
	})
		.on('error', function(err) {
			logger.info({ type: 'error', msg: err, service: 'rabbitjs context' });
		});

	function ready() {
		if(++readyCount == 2){
			register(null, {
				connectionRabbitMQ : queue,
				connectionRabbitJS : rabbitjscontext
			})
		}
	}
}
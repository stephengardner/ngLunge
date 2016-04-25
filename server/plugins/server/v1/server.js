var express = require("express");
var logger = require("../../../components/logger")();
var http = require("http");
var Promise = require("promise");
var config = require("../../../config/environment");

module.exports = function setup(options, imports, register){
	var bus = imports.eventbus;
	var redis = imports.redis;
	var logger = imports.logger.info;
	/*
	var server = {
		instance : false,
		create : function(instance, config) {
			return new Promise(function(resolve, reject){
				if(server.instance) {return resolve(server.instance);}
				else {console.log("CREATING THE DANG SERVER ----------------\n\n");}

				instance.redisClient = redis;

				// Configure express
				var web = express();//require("../../../web-server");
				require("../../../config/routes")(web);
				require('../../../config/express')(web, instance);
				require('../../../routes')(web, instance);



				process.on('SIGTERM', shutdown);

				// Create http server
				server.instance = http.createServer(web, config)
					.listen(config.port, config.ip, onListen);

				instance
					.removeListener('lost', abort)
					.on('lost', shutdown);

				function onListen(something) {
					logger.info({
						type: 'info',
						msg: 'appv2 server plugin listening',
						port: server.instance.address().port
					});
					bus.emit('server-ready', server.instance);
				}
				function shutdown() {
					logger.log({ type: 'info', msg: 'appv2 plugin shutting down' });
					server.close(function() {
						logger.log({ type: 'info', msg: 'exiting' });
						process.exit();
					});
				}
				resolve(server);
			})

		}
	};
	function abort() {
		logger.info("Apartminty: abort()");
		logger.log({ type: 'info', msg: 'appv2 plugin shutting down', abort: true });
		process.exit();
	}
	register(null, {
		server : server
	});
	*/
	if(options.server) {
		logger.info("-------------- Creating Server ---------------\n");
		var express = imports.express;
		var server = http.createServer(express, config)
			.listen(config.port, config.ip, onListen)
		function onListen(something) {
			logger.info({
				type: 'info',
				msg: 'appv2 server plugin listening',
				port: server.address().port
			});
			bus.emit('server-ready', server);
			register(null, {
				server : server
			})
		}
		function shutdown() {
			logger.log({ type: 'info', msg: 'appv2 plugin shutting down' });
			server.close(function() {
				logger.log({ type: 'info', msg: 'exiting' });
				process.exit();
			});
		}
	}
	else {
		register(null,{
			server : false
		})
	}
}
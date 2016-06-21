var express = require("express");
var logger = require("../../../components/logger")();
var http = require("http");
var Promise = require("promise");
var config = require("../../../config/environment");

module.exports = function setup(options, imports, register){
	var bus = imports.eventbus,
		logger = imports.logger.info
	;
	
	if(options.server) {
		logger.info("-------------- Creating Server ---------------\n");
		var express = imports.express;
		var server = http.createServer(express, config)
			.listen(config.port, config.ip, onListen);
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
			server : {} // important to return an object here, not a boolean
		})
	}
}
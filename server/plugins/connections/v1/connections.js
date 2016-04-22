var http = require("http");
EventEmitter = require('events').EventEmitter;


module.exports = function setup(options, imports, register) {
	var connector = imports.connector,
		config = options.config;

	var Connections = connector.connect(config.mongo.uri, config.rabbit_url);

	Connections.on('ready', onConnectionsReady)

	function onConnectionsReady() {
		register(null, {
			connections : Connections
		})
	}
};

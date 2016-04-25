var http = require("http");
var web = require("../web-server");
var logger = require("../components/logger")();
var express = require("express");
EventEmitter = require('events').EventEmitter;


module.exports = function setup(options, imports, register) {
	var connectionDatabase = imports.connectionDatabase,
		config = options.config,
		bus = imports.eventbus,
		amqp = imports.amqp;

	function App(config) {
		this.config = config;
		this.connectionDatabase = connectionDatabase;
		this.amqp = amqp;
	}

	App.prototype = Object.create(EventEmitter.prototype);

	var instance = new App(config);
	//instance.models = imports.models;
	instance.redisClient = imports.redis;
	//instance.bruteforce = imports.bruteforce;

	if(options.server) {
		instance.redisClient = imports.redis;
		var routes = imports.routes;
		routes.attach(imports.express);
	}


	register(null, {
		app : instance
	});
};
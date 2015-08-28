// make sure there is a NODE_ENV var
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var logger = require('../components/logger')();
var cpus = require('os').cpus().length;
var http = require('http');
var throng = require('throng');
var config = require('../config/environment');
var app = require('../app/index.js'); // I don't know why but this is requiring the full pathname to index.js
var web = require('../web-server');
var async = require("async");

http.globalAgent.maxSockets = Infinity;

// spin up our workers...? ok
throng(start, { workers: config.max_concurrency ? config.max_concurrency : 1 });

var instance;

function start() {
	instance = app(config);
	instance.on('ready', onSuccess);
	instance.on('lost', abort);

	function abort() {
		logger.info("Lunge: abort()");
		logger.log({ type: 'info', msg: 'shutting down', abort: true });
		process.exit();
	}
}


function onError(err) {
	logger.error(err);
}

function onSuccess() {
	instance.models.Activity.update({}, {created_at : new Date, updated_at : new Date}, {multi:true}, function(err, results){
		if(err) return logger.error(err);
		return logger.info(results);
	})
}

function onFinished() {
	process.exit();
}
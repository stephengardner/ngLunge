// make sure there is a NODE_ENV var
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var logger = require('../components/logger')();
var cpus = require('os').cpus().length;
var http = require('http');
var throng = require('throng');
var config = require('../config/environment');
var app = require('../app/index.js'); // I don't know why but this is requiring the full pathname to index.js
var web = require('../web-server');
require('longjohn');

http.globalAgent.maxSockets = 5;//Infinity;

// spin up our workers...? ok
throng(start, { workers: config.max_concurrency ? config.max_concurrency : 1 });

var instance;

function start() {
	logger.info({
		type: 'info',
		msg: 'starting server',
		concurrency: config.concurrency,
		thrifty: config.thrifty,
		timeout: config.timeout,
		busy_ms: config.busy_ms
	});
	instance = app(config);
	instance.once('ready', function(){

		instance.models.Trainer.findOne({email : 'opensourceaugie@gmail.com'}, function(err, trainer){
			trainer.locations = [];
			trainer.location = {};
			trainer.markModified('locations');
			trainer.save(function(err, savedTrainer){
				console.log("Saved trainer is:", savedTrainer);
			})
		})
	});
	function abort() {
		console.log("Lunge abort()");
		logger.log({ type: 'info', msg: 'shutting down', abort: true });
		process.exit();
	}
}


function onError(err) {
	logger.error(err);
}
function onSuccess() {}
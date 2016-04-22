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
	console.log("onSuccess()");
	var tasks = [];
	var specialties = require("../../client/allSpecialtyTypes");
	for(var i = 0; i < specialties.length; i++) {
		var specialty = specialties[i];
		tasks.push(function(callback){
			var newSpecialty = {
				name : this,
				created_at : new Date,
				updated_at : new Date
			};
			//console.log("Specialty:", newSpecialty);
			var newSpecialtyModel = new instance.models.Specialty(newSpecialty);
			newSpecialtyModel.save(function(err, result){
				if(err) return callback(err);
				return callback(null, result);
			})
		}.bind(specialty))
	}
	async.series(tasks, function(err, results){
		if(err) return logger.error(err);
		//logger.info(results);
		onFinished();
	})
}

function onFinished() {
	process.exit();
}
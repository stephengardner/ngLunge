
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
var Lob = require("lob")('live_a0338c3b32162bea3909525bd128eb17028');
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
	var SmartyStreets = require('machinepack-smartystreets');

// Verify one or more addresses using the SmartyStreets API
	SmartyStreets.verifyAddress({
		authId: 'e8d46275-e58b-4b69-82c8-5d02745a5574',
		authToken: 'LCpI38kWxnO74Nw7ErxX',
		street: '1368 monroe st nw',
		//input_id: 'address-123',
		//street2: 'North',
		//secondary: 'Suite 2A',
		city: 'ada',
		state: 'Delaware',
		zipcode: '20009',
		//lastline: 'Doylestown, PA 18901',
		//addressee: 'Jane Doe',
		//urbanization: 'San Juan',
		//candidates: '1, 5, or 10 (max value)'
	}).exec({
// An unexpected error occurred.
		error: function (err){
			logger.error(err);
		},
// OK.
		success: function (data){
			logger.info("Data?", data);
		},
	});
	/*
	instance.models.Activity.update({}, {created_at : new Date, updated_at : new Date}, {multi:true}, function(err, results){
		if(err) return logger.error(err);
		return logger.info(results);
	})
	*/
}

function onFinished() {
	process.exit();
}
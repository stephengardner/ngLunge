// make sure there is a NODE_ENV var

if(process.env.NODE_ENV == "foreman" || !process.env.NODE_ENV) {
	var _ = require("lodash");
	_.merge(process.env, require("../config/local.env.js"));
	process.env.NODE_ENV = "development";
	console.log("OK");
}
var logger = require('../components/logger')();
var cpus = require('os').cpus().length;
var http = require('http');
var throng = require('throng');
var config = require('../config/environment');
//var app = require('./app/index.js'); // I don't know why but this is requiring the full pathname to index.js
var web = require('../web-server');
//require('longjohn');

http.globalAgent.maxSockets = Infinity;

// spin up our workers...? ok
throng(start, { workers: config.max_concurrency ? config.max_concurrency : 1 });

var instance;


function start() {
	config.handleQueues = false;
	config.handleServer = false;
	var architect = require("architect");
	var tree = require("../app_v2/architect/scraper")(config);
	architect.createApp(tree, function(err, Architect){
		if(err) { logger.error(err) }
		else { onCreateApp(Architect)}
	})

	function onCreateApp(Architect) {
		logger.info("App created!");
		//var socketio = Architect.getService('socket');
		//var defaultNamespace = socketio.of('/');
		//defaultNamespace.on('connection', function(socket){
		//	console.log("!!!!!!!!!!!!!!!");
		//});
		var Scraper = Architect.getService('scraper');
		//Scraper.processAllOrganizations('http://www.ideafit.com/certifications').then(function(response){
		//	console.log("DONE...");
		//}).catch(function(err){
		//	logger.error(err);
		//	logger.error(err.message);
		//});
		var arrayFromResults = require("../../results-full.json");
		Scraper.saveFromFile(arrayFromResults).then(function(response){
		}).catch(function(err){
			logger.error(err);
			logger.error(err.message);
		});
	}
}
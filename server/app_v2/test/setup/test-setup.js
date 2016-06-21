'use strict';
//process.env.NODE_ENV = 'development';

var setup = {
	architect : false,
	web : false,
	initialized : false,
	before : function() {
		if(!this.initialized) {
			console.log("\n*****************************************\n" +
			"test-setup running (make sure this isn't runniing multiple times)" +
			"\n*****************************************\n");
			this.initialized = true; 
			before(function (done) {
				this.timeout(10000);
				console.log("\n ---- test-setup.js running ----\n");
				var app = require("../../../app.noserver");
				app.on('ready', function (architect) {
					console.log("\n ---- test-setup.js READY fired ----\n");
					// setup.tests = tests;
					setup.architect = architect;
					// setup.web = architect.getService('app').web;
					var bus = architect.getService('eventbus');
					done();
					// bus.on('amqp-ready', function(){
					// 	done();
					// })
				})
				// done();
			});
		}
	}
};
setup.before();

module.exports = setup;
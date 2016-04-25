var config = require("../../../config/environment");
module.exports = function setup(options, imports, register) {
	console.log("Setting up bruteforce");
	var ExpressBrute = require('express-brute'),
		MongoStore = require('express-brute-mongo');

	var MongoClient = require('mongodb').MongoClient;

	var store = new MongoStore(function (ready) {
		MongoClient.connect(config.mongo.uri, function(err, db) {
			if (err) throw err;
			console.log("Express-Brute has been initialized!");
			ready(db.collection('bruteforce-store'));
		});
	});

	//var bruteforce = new ExpressBrute(store);

	var bruteforce = {
		global : new ExpressBrute(store, {
			freeRetries : 10,
			maxWait: 60 * 1000 // 1 minute
		})
	}

	register(null, {
		bruteforce : bruteforce
	})
}
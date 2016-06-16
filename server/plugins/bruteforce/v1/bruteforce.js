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
		}),
		trainerRegistration : new ExpressBrute(store, {
			freeRetries : 2,
			minWait : 10 * 1000, // 10 seconds
			maxWait: 60 * 10000 // 10 minutes
		}),
		trainerContactInquiry : new ExpressBrute(store, {
			freeRetries : 1,
			minWait : 10 * 1000, // 10 seconds
			maxWait: 60 * 10000 // 10 minutes
		}),
		// Allow 50 contact inquiries per day per IP.  Used in conjunction with TrainerContactInquiry.
		trainerContactInquiryMaxDaily : new ExpressBrute(store, {
			freeRetries : 50, // 50 messages daily allowed
			minWait: 25*60*60*1000, // 1 day 1 hour (should never reach this wait time)
			maxWait: 25*60*60*1000, // 1 day 1 hour (should never reach this wait time)
			lifetime: 24*60*60 // 1 day (seconds not milliseconds)
		}),
		trainerPasswordReset : new ExpressBrute(store, {
			freeRetries : 1,
			minWait : 10 * 1000, // 10 seconds
			maxWait: 60 * 10000 // 10 minutes
		}),
		// used for endpoints that send an email, like submitting a password reset
		email : new ExpressBrute(store, {
			freeRetries : 1,
			minWait : 10 * 1000, // 10 seconds
			maxWait: 60 * 10000 // 10 minutes
		})
	};

	register(null, {
		bruteforce : bruteforce
	})
}
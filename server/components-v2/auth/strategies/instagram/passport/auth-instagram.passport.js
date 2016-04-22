var passport = require('passport'),
	TwitterStrategy = require('passport-twitter').Strategy,
	config = require("../../../../../config/environment"),
	_ = require('lodash')
	;
module.exports = function setup(options, imports, register) {
	var trainerModel = imports.trainerModel;
	var strategy = new TwitterStrategy({
			consumerKey: config.twitter.clientID,
			consumerSecret: config.twitter.clientSecret,
			callbackURL: config.twitter.callbackURL
		},
		function(token, tokenSecret, profile, done) {
			console.log("Check----------------------------------\n\n");
			return done(null, profile);
		});

	function doSetup() {
		console.log("Setting up Facebook Passport");
		passport.use('twitterTrainerSync', strategy);
	}
	doSetup();

	register(null, {
		authTwitterPassport : strategy
	})
};
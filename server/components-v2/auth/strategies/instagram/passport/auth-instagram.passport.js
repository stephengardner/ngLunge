var passport = require('passport'),
	InstagramStrategy = require('passport-instagram').Strategy,
	config = require("../../../../../config/environment"),
	_ = require('lodash')
	;
module.exports = function setup(options, imports, register) {
	var trainerModel = imports.trainerModel;
	var strategy = new InstagramStrategy({
			clientID: config.instagram.clientID,
			clientSecret: config.instagram.clientSecret,
			callbackURL: config.instagram.callbackURL
		},
		function(accessToken, refreshToken, profile, done) {
			console.log("Got profile:", profile);
			return done(null, profile);
		});

	function doSetup() {
		console.log("Setting up Instagram Passport");
		passport.use('instagramTrainerSync', strategy);
	}
	doSetup();

	register(null, {
		authInstagramPassport : strategy
	})
};
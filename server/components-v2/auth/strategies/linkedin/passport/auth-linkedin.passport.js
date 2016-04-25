var passport = require('passport'),
	LinkedInStrategy = require('passport-linkedin-oauth2').Strategy,
	config = require("../../../../../config/environment"),
	_ = require('lodash')
	;
module.exports = function setup(options, imports, register) {
	var trainerModel = imports.trainerModel;
	console.log("Am i here?");
	var strategy = new LinkedInStrategy({
			clientID: config.linkedin.clientID,
			clientSecret: config.linkedin.clientSecret,
			callbackURL: config.linkedin.callbackURL,
			scope: ['r_basicprofile', 'r_emailaddress'],
			state : true
		},
		function(accessToken, refreshToken, profile, done) {
			console.log("Am i here, too?");
			return done(null, profile);
		});

	function doSetup() {
		console.log("Setting up LinkedIn Passport");
		passport.use('linkedinTrainerSync', strategy);
	}
	doSetup();

	register(null, {
		authLinkedinPassport : strategy
	})
};
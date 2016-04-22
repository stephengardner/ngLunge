var passport = require('passport'),
	LinkedInStrategy = require('passport-linkedin').Strategy,
	config = require("../../../../../config/environment"),
	_ = require('lodash')
	;
module.exports = function setup(options, imports, register) {
	var trainerModel = imports.trainerModel;
	var strategy = new LinkedInStrategy({
			consumerKey: config.linkedin.clientID,
			consumerSecret: config.linkedin.clientSecret,
			callbackURL: config.linkedin.callbackURL,
			profileFields: ['id', 'first-name', 'last-name', 'email-address', 'headline', 'summary', 'picture-url', 'public-profile-url'],
			passReqToCallback : true
		},
		function(req, token, tokenSecret, profile, done) {
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
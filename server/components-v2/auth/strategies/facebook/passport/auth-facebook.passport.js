var passport = require('passport'),
	FacebookStrategy = require('passport-facebook').Strategy,
	config = require("../../../../../config/environment"),
	graph = require('fbgraph'),
	_ = require('lodash')
	;
module.exports = function setup(options, imports, register) {
	var trainerModel = imports.trainerModel;
	var strategy = new FacebookStrategy({
			passReqToCallback: true,
			clientID: config.facebook.clientID,
			clientSecret: config.facebook.clientSecret,
			callbackURL: config.facebook.callbackURL,
			profileFields : ['id', 'displayName', 'photos', 'email', 'profileUrl']
		},
		function(req, accessToken, refreshToken, profile, done) {
			// The req.session.trainer is added in auth.isTrainerMe.
			graph.setAccessToken(accessToken);
			// get the larger version of the facebook picture
			graph.get("/" + profile.id + "/picture", { width : 300 },  function(err, res) {
				profile._json.picture.data.thumbnail = _.merge({}, profile._json.picture.data);
				profile._json.picture.data.url = res.location;
				console.log("Lunge: Facebook Graph API returned an updated photo.  " +
				"And we've successfully set the new facebook.picture.data.url = " + res.location);
				return done(null, profile);
			});
		});

	function doSetup() {
		console.log("Setting up Facebook Passport");
		passport.use('facebookTrainerSync', strategy);
	}
	doSetup();

	register(null, {
		authFacebookPassport : strategy
	})
};
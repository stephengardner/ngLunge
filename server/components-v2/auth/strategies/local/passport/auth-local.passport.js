var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var config = require("../../../../../config/environment");

module.exports = function setup(options, imports, register) {
	var Trainer = imports.trainerModel;
	var User = imports.userModel;

	var trainerLocalStrategy = new LocalStrategy({
			// by default, local strategy uses username and password, we will override with email
			usernameField: 'email',
			passwordField : 'password',
			passReqToCallback : true // allows us to pass back the entire request to the callback
		},
		function(req, email, password, done) {
			console.log("passport.js req.body.type = (should be user or trainer)", req.body.type);
			if(req.body.type == "trainer") {
				Trainer.findOne({
					email: email.toLowerCase()
				}, function(err, trainer) {
					if (err) return done(err);
					if (!trainer) {
						return done(null, false, { field : 'email', message: 'This email is not registered.' });
					}
					if (!trainer.authenticate(password)) {
						return done(null, false, { field : 'password', message: 'This password is not correct.' });
					}
					return done(null, trainer);
				});
			}
			else {
				return done(null, {});
			}
		}
	);

	var userLocalStrategy = new LocalStrategy({
			// by default, local strategy uses username and password, we will override with email
			usernameField: 'email',
			passwordField : 'password',
			passReqToCallback : true // allows us to pass back the entire request to the callback
		},
		function(req, email, password, done) {
			console.log("passport.js req.body.type = (should be user or trainer)", req.body.type);
			User.findOne({
				email: email.toLowerCase()
			}, function(err, trainer) {
				if (err) return done(err);
				if (!trainer) {
					return done(null, false, { field : 'email', message: 'This email is not registered.' });
				}
				if (!trainer.authenticate(password)) {
					return done(null, false, { field : 'password', message: 'This password is not correct.' });
				}
				return done(null, trainer);
			});
		}
	);

	function doSetup() {
		passport.use('local-trainer', trainerLocalStrategy);
		passport.use('local-user', userLocalStrategy);
	}
	register(null, {
		authLocalPassport : {
			setup : doSetup
		}
	})
};
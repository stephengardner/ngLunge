var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var config = require("../../../../../config/environment");
module.exports = function setup(options, imports, register) {
	var Trainer = imports.trainerModel;
	var strategy = new LocalStrategy({
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
						return done(null, false, { message: 'This email is not registered.' });
					}
					if (!trainer.authenticate(password)) {
						return done(null, false, { message: 'This password is not correct.' });
					}
					return done(null, trainer);
				});
			}
			else {
				return done(null, {});
			}
		}
	);
	function doSetup() {
		passport.use(strategy);
	}
	register(null, {
		authLocalPassport : {
			setup : doSetup
		}
	})
};
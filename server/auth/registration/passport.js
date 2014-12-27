var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

exports.setup = function (Registration, config) {
	passport.use(new LocalStrategy({
			hashField: 'authenticationHash'
		},
		function(authenticationHash, done) {
			Registration.findOne({
				authenticationHash: authenticationHash.toLowerCase()
			}, function(err, registration) {
				if (err) return done(err);
				if (!registration) {
					return done(null, false, { message: 'This registration is not valid.' });
				}
				return done(null, registration);
			});
		}
	));
};
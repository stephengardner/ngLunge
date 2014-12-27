var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

exports.setup = function (User, config) {
	passport.use(new GoogleStrategy({
			clientID: config.google.clientID,
			clientSecret: config.google.clientSecret,
			callbackURL: config.google.callbackURL
		},
		function(accessToken, refreshToken, profile, done) {
			console.log("GOOGLE PROFILE: ", profile);
			User.findOne({
				'google.id': profile.id
			}, function(err, user) {
				var userObject = {
					name: profile.displayName,
					email: profile.emails[0].value,
					role: 'user',
					username: profile.username,
					provider: 'google',
					google: profile._json
				}
				if (!user) {
					user = new User(userObject);
					user.save(function(err) {
						if (err) done(err);
						return done(err, user);
					});
				} else {
					// update the user if it already exists
					user.update(userObject, function(err, numUpdated){
						if (err) done(err);
						return done(err, user);
					});
				}
			});
		}
	));
};

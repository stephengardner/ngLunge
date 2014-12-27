exports.setup = function (User, config) {
	var passport = require('passport');
	var TwitterStrategy = require('passport-twitter').Strategy;

	passport.use(new TwitterStrategy({
			consumerKey: config.twitter.clientID,
			consumerSecret: config.twitter.clientSecret,
			callbackURL: config.twitter.callbackURL
		},
		function(token, tokenSecret, profile, done) {
			User.findOne({
				'twitter.id_str': profile.id
			}, function(err, user) {
				if (err) {
					return done(err);
				}
				var role = "user";
				/*
				for(var i = 0; i < config.SUPERUSERS.ADMINS.length; i++){
					if(profile.emails[0].value == config.SUPERUSERS.ADMINS[i]) {
						role = "admin";
					}
				}
				*/
				if (err) {
					return done(err);
				}
				console.log("TWITTER PROFILE:",profile);
				if (!user) {
					var userObject = {
						name: profile.displayName,
						username: profile.username,
						role: role,
						provider: 'twitter',
						twitter: profile._json
					}
					user = new User(userObject);
					user.save(function(err) {
						if (err) return done(err);
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
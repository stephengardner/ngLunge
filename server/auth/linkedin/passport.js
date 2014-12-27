var passport = require('passport');
var LinkedInStrategy = require('passport-linkedin').Strategy;
var http = require('http');

exports.setup = function (User, config) {
	console.log("CONFIG IS:", config);
	passport.use(new LinkedInStrategy({
			consumerKey: config.linkedin.clientID,
			consumerSecret: config.linkedin.clientSecret,
			callbackURL: config.linkedin.callbackURL,
			profileFields: ['id', 'first-name', 'last-name', 'email-address', 'headline', 'summary', 'picture-url', 'public-profile-url'],
			passReqToCallback : true
		},
		function(req, token, tokenSecret, profile, done) {
			User.findOne({
				'linkedin.id': profile.id
			}, function(err, user) {
				console.log("==============LINKEDIN=============", profile);
				if(req.user) {
					console.log("Warning returning done");
					return done(req.user)
				}
				else {User.findOne({
						'linkedin.id': profile.id
					},
					function(err, user) {
						var role = "user";
						for(var i = 0; i < config.SUPERUSERS.ADMINS.length; i++){
							if(profile.emails[0].value == config.SUPERUSERS.ADMINS[i]) {
								role = "admin";
							}
						}
						if (err) {
							return done(err);
						}
						// Slightly tricky, but here we are checking if the user has EVER been logged in using this
						// facebook account.
						// Even when a trainer is linking it, a user profile is still technically created
						// We want to make sure we Update this too, because a user's information might have changed
						// and we want to grab the most up-to-date and accurate representation of that FB user
						// When we call back, we pass the user, and if this is a trainer linking their profile,
						// the profile._json will be saved in after the done() callback
						var username = profile.name.familyName ? profile.name.givenName + "-" + profile.name.familyName : profile.name.givenName;
						var userObject = {
							name: { first : profile.name.givenName, last : profile.name.familyName },
							email: profile.emails[0].value,
							role: role,
							username: username,
							provider: 'linkedin',
							linkedin: profile._json
						};
						if (!user) {
							// create a user if it doesn't exist, even if we're just linking the Trainer account
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
					})
				}
			});
		}
	));
};
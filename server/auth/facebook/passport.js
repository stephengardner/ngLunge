var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var http = require('http');
var graph = require('fbgraph');

exports.setup = function (User, config) {
	passport.use(new FacebookStrategy({
			passReqToCallback: true,
			clientID: config.facebook.clientID,
			clientSecret: config.facebook.clientSecret,
			callbackURL: config.facebook.callbackURL,
			profileFields : ['id', 'displayName', 'photos', 'email', 'profileUrl']
		},
		function(req, accessToken, refreshToken, profile, done) {
			if(req.user) {
				done(null, req.user)
			}
			else {
				User.findOne({
						'facebook.id': profile.id
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
						// get a larger profile picture from facebook
						// facebook's api only returns a 50x50 thumbnail when you try and access it along with other parameters
						graph.setAccessToken(accessToken);
						graph.get("/" + profile.id + "/picture", { width : 300 },  function(err, res) {
							User.update({email : profile.emails[0].value}, {'facebook.picture.data.url' : res.location}, function(err, doc) {
								console.log("Lunge: Facebook Graph API returned an updated photo.  And we've successfully set the new facebook.picture.data.url.");
							});
						});

						// Slightly tricky, but here we are checking if the user has EVER been logged in using this
						// facebook account.
						// Even when a trainer is linking it, a user profile is still technically created
						// We want to make sure we Update this too, because a user's information might have changed
						// and we want to grab the most up-to-date and accurate representation of that FB user
						// When we call back, we pass the user, and if this is a trainer linking their profile,
						// the profile._json will be saved in after the done() callback
						if (!user) {
							// create a user if it doesn't exist, even if we're just linking the Trainer account
							user = new User({
								name: profile.displayName,
								email: profile.emails[0].value,
								role: role,
								username: profile.username,
								provider: 'facebook',
								facebook: profile._json
							});
							user.save(function(err) {
								if (err) done(err);
								return done(err, user);
							});
						} else {
							// update the user if it already exists
							user.update({
								name: profile.displayName,
								email: profile.emails[0].value,
								role: role,
								username: profile.username,
								provider: 'facebook',
								facebook: profile._json
							}, function(err, numUpdated){
								if (err) done(err);
								return done(err, user);
							});
						}
					})
			}
		}
	));
};
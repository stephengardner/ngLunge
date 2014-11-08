var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var http = require('http');
var graph = require('fbgraph');

exports.setup = function (User, config) {
	passport.use(new FacebookStrategy({
			clientID: config.facebook.clientID,
			clientSecret: config.facebook.clientSecret,
			callbackURL: config.facebook.callbackURL,
			profileFields : ['id', 'displayName', 'photos', 'email']
		},
		function(accessToken, refreshToken, profile, done) {
			User.findOne({
					'facebook.id': profile.id
				},
				function(err, user) {
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
					if (!user) {
						user = new User({
							name: profile.displayName,
							email: profile.emails[0].value,
							role: 'user',
							username: profile.username,
							provider: 'facebook',
							facebook: profile._json
						});
						user.save(function(err) {
							if (err) done(err);
							return done(err, user);
						});
					} else {
						return done(err, user);
					}
				})
		}
	));
};
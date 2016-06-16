var jwt = require('jsonwebtoken'),
	request = require('request'),
	config = require('../../../../../config/environment'),
	graph = require('fbgraph'),
	_ = require('lodash'),
	async = require('async')
	;
module.exports = function setup(options, imports, register){
	var facebookSatellizer = function(req, res, next) {
		console.log("facebookSatellizer");
		var fields = ['id', 'email', 'first_name', 'last_name', 'link', 'name'];
		var accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
		var graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=' + fields.join(',');
		var params = {
			code: req.body.code,
			client_id: req.body.clientId,
			client_secret: config.facebook.clientSecret,
			redirect_uri: req.body.redirectUri
		};
		var accessToken, profile, getProfilePicture = false;

		console.log("facebookSatellizer");

		// If syncing or registering, get the profile picture, otherwise just log in.
		if(req.body.type == 'trainer-sync' ||
			req.body.type == 'trainer-register') {
			getProfilePicture = true;
		}
		async.waterfall([
			// Step 1. Exchange authorization code for access token.
			function exchange(callback) {
				console.log("Exchange");
				request.get({ url: accessTokenUrl, qs: params, json: true },
					function(err, response, accessTokenResponse) {
						accessToken = accessTokenResponse;
						// req.accessToken = accessToken.access_token;
						if (response.statusCode !== 200) {
							return res.status(500).send({message: accessTokenResponse.error.message});
						}
						return callback();
					});
			},
			// Step 2. Retrieve profile information about the current user.
			function retrieve(callback) {
				console.log("Retrieve");
				request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profileResponse) {
					profile = profileResponse;
					if (response.statusCode !== 200) {
						return res.status(500).send({ message: profile.error.message });
					}
					return callback();
				});
			},
			function getProfilePicture(callback) {
				// If register
				if(getProfilePicture) {
					// get the larger version of the facebook picture
					graph.setAccessToken(accessToken.access_token);
					graph.get("/" + profile.id + "/picture", { width : 300, height : 300 },  function(err, res) {
						if(err) return reject(err);
						try {
							profile.picture = {
								small : {
									url : 'http://graph.facebook.com/' + profile.id + '/picture?type=small'
								},
								medium : {
									url : 'http://graph.facebook.com/' + profile.id + '/picture?type=medium'
								},
								large : {
									url : 'http://graph.facebook.com/' + profile.id + '/picture?type=large'
								},
								graph : {
									url : res.location
								}
							};
						}
						catch(err) {
							return callback(err);
						}
						return callback();
					});
				}
				else {
					callback();
				}
			}
		], function(err, response){
			req.profile = profile;
			if(err) return res.status(500).send(err);
			return next();
		});
	};

	function setTrainerBasedOnFacebookDetails(trainer) {
		return new Promise(function(resolve, reject){
			graph.setAccessToken(accessToken.access_token);
			console.log("profile._json is:", profile._json);
			// get the larger version of the facebook picture
			graph.get("/" + profile.id + "/picture", { width : 300, height : 300 },  function(err, res) {
				if(err) return reject(err);
				try {
					profile.picture = {
						small : {
							url : 'http://graph.facebook.com/' + profile.id + '/picture?type=small'
						},
						medium : {
							url : 'http://graph.facebook.com/' + profile.id + '/picture?type=medium'
						},
						large : {
							url : 'http://graph.facebook.com/' + profile.id + '/picture?type=large'
						},
						graph : {
							url : res.location
						}
					};
					trainer.facebook = JSON.parse(JSON.stringify(profile));
					trainer.email = profile.email;
					trainer.name.full = profile.name;
				}
				catch(err) {
					return reject(err);
				}
				return resolve(trainer);
			});
		})
	}

	register(null, {
		facebookSatellizer : facebookSatellizer
	})
}
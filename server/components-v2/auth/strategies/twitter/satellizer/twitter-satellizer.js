var jwt = require('jsonwebtoken'),
	request = require('request'),
	config = require('../../../../../config/environment'),
	graph = require('fbgraph'),
	_ = require('lodash'),
	async = require('async'),
	qs = require('querystring')
	;
module.exports = function setup(options, imports, register){
	var twitterSatellizer = function(req, res, next) {
		var requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
		var accessTokenUrl = 'https://api.twitter.com/oauth/access_token';
		var profileUrl = 'https://api.twitter.com/1.1/users/show.json?screen_name=',
			twitterClientId = config.twitter.clientID,
			twitterSecret = config.twitter.clientSecret,
			accessToken,
			accessTokenOauth,
			profileOauth,
			profile
		;

		console.log("twitterSatellizer");
		async.waterfall([
			// Part 1 of 2: Initial request from Satellizer.
			function initial(callback) {
				if (!req.body.oauth_token || !req.body.oauth_verifier) {
					var requestTokenOauth = {
						consumer_key: twitterClientId,
						consumer_secret: twitterSecret,
						callback: req.body.redirectUri
					};
					// Step 1. Obtain request token for the authorization popup.
					request.post({ url: requestTokenUrl, oauth: requestTokenOauth }, function(err, response, body) {
						if(err) return callback(err);
						var oauthToken = qs.parse(body);
						// Step 2. Send OAuth token back to open the authorization screen.
						return res.send(oauthToken);
					});
				} else {
					// Part 2 of 2: Second request after Authorize app is clicked.
					accessTokenOauth = {
						consumer_key: twitterClientId,
						consumer_secret: twitterSecret,
						token: req.body.oauth_token,
						verifier: req.body.oauth_verifier
					};
					callback();
				}
			},
			// Step 3. Exchange oauth token and oauth verifier for access token.
			function exchange(callback) {
				request.post({ url: accessTokenUrl, oauth: accessTokenOauth }, function(err, response, accessTokenResponse) {
					if(err) return callback(err);
					accessToken = qs.parse(accessTokenResponse);

					profileOauth = {
						consumer_key: twitterClientId,
						consumer_secret: twitterSecret,
						oauth_token: accessToken.oauth_token
					};
					callback();
				});
			},
			function retrieve(callback) {
				// Step 4. Retrieve profile information about the current user.
				request.get({
					url: profileUrl + accessToken.screen_name,
					oauth: profileOauth,
					json: true
				}, function(err, response, profileResponse) {
					if(err) return callback(err);
					profile = profileResponse;
					callback();
				});
			}
		], function(err, response){
			profile.link = "https://twitter.com/" + profile.screen_name;
			req.profile = profile;
			if(err) return res.status(500).send(err);
			return next();
		});
	};

	register(null, {
		twitterSatellizer : twitterSatellizer
	})
}
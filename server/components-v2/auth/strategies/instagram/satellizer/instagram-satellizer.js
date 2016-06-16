var jwt = require('jsonwebtoken'),
	request = require('request'),
	config = require('../../../../../config/environment'),
	graph = require('fbgraph'),
	_ = require('lodash'),
	async = require('async'),
	qs = require('querystring')
	;
module.exports = function setup(options, imports, register){
	var instagramSatellizer = function(req, res, next) {
		var accessTokenUrl = 'https://api.instagram.com/oauth/access_token';

		var params = {
			client_id: req.body.clientId,
			redirect_uri: req.body.redirectUri,
			client_secret: config.instagram.clientSecret,
			code: req.body.code,
			grant_type: 'authorization_code'
		};

		var profile;

		console.log("instagramSatellizer");
		async.waterfall([
			// Step 1. Exchange authorization code for access token.
			function retrieve(callback) {
				request.post({ url: accessTokenUrl, form: params, json: true }, function(err, response, body) {
					if(err) return callback(err);
					profile = body.user;
					return callback();
				});
			}
		], function(err, response){
			profile.link = "https://instagram.com/" + profile.username;
			req.profile = profile;
			console.log("profile is:", profile);
			if(err) return res.status(500).send(err);
			return next();
		});
	};

	register(null, {
		instagramSatellizer : instagramSatellizer
	})
}
var jwt = require('jsonwebtoken'),
	request = require('request'),
	config = require('../../../../../config/environment'),
	graph = require('fbgraph'),
	_ = require('lodash'),
	async = require('async')
	;
module.exports = function setup(options, imports, register){
	var linkedinSatellizer = function(req, res, next) {
		var accessTokenUrl = 'https://www.linkedin.com/uas/oauth2/accessToken';
		var peopleApiUrl = 'https://api.linkedin.com/v1/people/~:(id,first-name,last-name,email-address,picture-url,' +
			'public-profile-url)';
		var params = {
			code: req.body.code,
			client_id: req.body.clientId,
			client_secret: config.linkedin.clientSecret,
			redirect_uri: req.body.redirectUri,
			grant_type: 'authorization_code'
		};
		var accessToken;

		console.log("linkedinSatellizer");
		async.waterfall([
			// Step 1. Exchange authorization code for access token.
			function exchange(callback) {
				request.post(accessTokenUrl, { form: params, json: true }, function(err, response, body) {
					if (response.statusCode !== 200) {
						return res.status(response.statusCode).send({message: body.error_description});
					}
					accessToken = body.access_token;
					callback();
				});
			},
			// Step 2. Retrieve profile information about the current user.
			function retrieve(callback) {
				var params = {
					oauth2_access_token: accessToken,
					format: 'json'
				};
				request.get({ url: peopleApiUrl, qs: params, json: true }, function(err, response, profile) {
					console.log("The profile is:", profile);
					profile.link = profile.publicProfileUrl;
					req.profile = profile;
					callback();
				});
			}
		], function(err, response){
			if(err) return res.status(500).send(err);
			return next();
		});
	};

	register(null, {
		linkedinSatellizer : linkedinSatellizer
	})
}
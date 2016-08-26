var jwt = require('jsonwebtoken'),
	request = require('request'),
	config = require('../../../../../../config/environment'),
	graph = require('fbgraph'),
	_ = require('lodash')
	;
module.exports = function setup(options, imports, register){
	var trainerModel = imports.trainerModel,
		auth = imports.auth,
		createJWT = auth.signToken,
		userModel = imports.userModel
	;
	var facebookSatellizerLogin = function(req, res) {
		// Profile received from FacebookSatellizer middleware
		var profile = req.profile,
			kind
		;
		
		if(req.body.type && req.body.type.indexOf('trainee') != -1) {
			kind = "trainee";
		}
		else {
			kind = 'trainer';
		}

		console.log("Finding kind:", kind);

		userModel.findOne({ 'registration_providers.facebook' : profile.id, 'kind' : kind }, function(err, existingUser) {
			if (existingUser) {
				var token = auth.signToken(existingUser._id, req.body.type);
				// console.log("Setting token for user: ", existingUser, " on cookies... token is: " + token);
				res.cookie('token', JSON.stringify(token));
				res.cookie('type', JSON.stringify(kind));
				var returnObject = {
					token : token,
					type : kind
				};
				returnObject[kind] = existingUser;
				res.send(returnObject);
			}
			else {
				return res.status(404).send({
					message : 'You are not registered yet'
				});
			}
		});
	};
	register(null, {
		facebookSatellizerLogin : facebookSatellizerLogin
	})
}
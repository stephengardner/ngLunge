var jwt = require('jsonwebtoken'),
	request = require('request'),
	config = require('../../../../../../config/environment'),
	graph = require('fbgraph'),
	_ = require('lodash')
	;
module.exports = function setup(options, imports, register){
	var trainerModel = imports.trainerModel,
		userModel = imports.userModel,
		auth = imports.auth,
		createJWT = auth.signToken;
	var linkedinSatellizerLogin = function(req, res) {
		// Profile received from FacebookSatellizer middleware
		var profile = req.profile;

		if(req.body.type && req.body.type.indexOf('trainee') != -1) {
			type = "trainee";
			Model = userModel;
		}
		else {
			type = 'trainer';
			Model = trainerModel;
		}
		// if (req.header('Authorization')) {
		Model.findOne({ 'registration_providers.linkedin' : profile.id }, function(err, existingUser) {
				if (existingUser) {
					var token = auth.signToken(existingUser._id, req.body.type);
					// console.log("Setting token for user: ", existingUser, " on cookies... token is: " + token);
					res.cookie('token', JSON.stringify(token));
					res.cookie('type', JSON.stringify(type));
					var returnObject = {
						token : token,
						type : type
					};
					returnObject[type] = existingUser;
					res.send(returnObject);
				}
				else {
					return res.status(404).send({
						message : 'You are not registered yet'
					});
				}
			});
		// } else {
		// 	return res.status(404).send({
		// 		message : 'There was a problem logging you in'
		// 	});
		// }
	};
	register(null, {
		linkedinSatellizerLogin : linkedinSatellizerLogin
	})
}
var jwt = require('jsonwebtoken'),
	request = require('request'),
	config = require('../../../../../../config/environment'),
	graph = require('fbgraph'),
	_ = require('lodash')
	;
module.exports = function setup(options, imports, register){
	var trainerModel = imports.trainerModel,
		auth = imports.auth,
		createJWT = auth.signToken;
	var facebookSatellizerLogin = function(req, res) {
		// Profile received from FacebookSatellizer middleware
		var profile = req.profile;

		trainerModel.findOne({ 'registration_providers.facebook' : profile.id }, function(err, existingUser) {
			if (existingUser) {
				var token = createJWT(existingUser);
				res.cookie('token', JSON.stringify(token));
				res.cookie('type', JSON.stringify('trainer'));
				res.send({ token: token, type : 'trainer', trainer: existingUser });
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
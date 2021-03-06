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
	var twitterSatellizerLogin = function(req, res) {
		// Profile received from FacebookSatellizer middleware
		var profile = req.profile;

		// if (req.header('Authorization')) {
			trainerModel.findOne({ 'registration_providers.linkedin' : profile.id }, function(err, existingUser) {
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
		// } else {
		// 	return res.status(404).send({
		// 		message : 'There was a problem logging you in'
		// 	});
		// }
	};
	register(null, {
		twitterSatellizerLogin : twitterSatellizerLogin
	})
}
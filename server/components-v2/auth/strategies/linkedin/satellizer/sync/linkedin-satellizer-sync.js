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
	var linkedinSatellizerSync = function(req, res) {
		var profile = req.profile;
		var trainer = req.trainer;

		console.log("linkedinSatellizerSync')");
		
		trainer.linkedin = JSON.parse(JSON.stringify(profile));
		trainer.linkedin.updated_at = new Date();
		trainer.save(function(err, user) {
			if(err) return res.status(500).send(500);
			return res.send({message : 'Linkedin synced successfully'});
		});
	};
	register(null, {
		linkedinSatellizerSync : linkedinSatellizerSync
	})
}
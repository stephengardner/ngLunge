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
	var twitterSatellizerSync = function(req, res) {
		var profile = req.profile;
		var trainer = req.trainer;

		trainer.twitter = JSON.parse(JSON.stringify(profile));
		trainer.twitter.updated_at = new Date();
		trainer.save(function(err, user) {
			if(err) return res.status(500).send(500);
			return res.send({message : 'Twitter synced successfully'});
		});
	};
	register(null, {
		twitterSatellizerSync : twitterSatellizerSync
	})
}
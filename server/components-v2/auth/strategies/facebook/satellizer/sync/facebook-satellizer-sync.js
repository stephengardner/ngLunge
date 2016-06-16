var jwt = require('jsonwebtoken'),
	request = require('request'),
	config = require('../../../../../../config/environment'),
	graph = require('fbgraph'),
	_ = require('lodash'),
	async = require('async')
	;
module.exports = function setup(options, imports, register){
	var facebookSatellizerSync = function(req, res) {
		var profile = req.profile;
		var trainer = req.trainer;
		trainer.facebook = JSON.parse(JSON.stringify(profile));
		trainer.save(function(err, user) {
			if(err) return res.status(500).send(500);//(err);
			return res.send({message : 'Facebook synced successfully'});
		});
	};
	register(null, {
		facebookSatellizerSync : facebookSatellizerSync
	})
}
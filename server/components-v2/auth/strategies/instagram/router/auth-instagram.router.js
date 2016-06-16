'use strict';

var express = require('express'),
	passport = require('passport'),
	config = require('../../../../../config/environment')
	;

module.exports = function setup(options, imports, register) {
	var auth = imports.auth,
		bruteforce = imports.bruteforce,
		router = express.Router(),
		trainerModel = imports.trainerModel,
		instagramSatellizer = imports.instagramSatellizer,
		instagramSatellizerSync = imports.instagramSatellizerSync
		;
	router.post('/', instagramSatellizer,
		function (req, res, next) {
			if (req.body.type == 'trainer-sync') {
				auth.authenticate()(req, res, function(){
					return instagramSatellizerSync(req, res, next);
				})
			}
			else {
				console.log("req.body:", req.body);
				res.status(404).send({
					message: 'No thanks'
				});
			}
		}
	);
	register(null, {
		authInstagramRouter : router
	});
}
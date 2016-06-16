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
		twitterSatellizer = imports.twitterSatellizer,
		twitterSatellizerSync = imports.twitterSatellizerSync,
		twitterSatellizerRegister = imports.twitterSatellizerRegister,
		twitterSatellizerLogin = imports.twitterSatellizerLogin
		;
	router.post('/', twitterSatellizer,
		function (req, res, next) {
			if (req.body.type == 'trainer-register') {
				return twitterSatellizerRegister(req, res, next);
			}
			else if (req.body.type == 'trainer-login') {
				return twitterSatellizerLogin(req, res, next);
			}
			else if (req.body.type == 'trainer-sync') {
				auth.authenticate()(req, res, function(){
					return twitterSatellizerSync(req, res, next);
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
		authTwitterRouter : router
	});
}
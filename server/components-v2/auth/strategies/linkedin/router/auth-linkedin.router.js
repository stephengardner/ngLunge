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
		linkedinSatellizer = imports.linkedinSatellizer,
		linkedinSatellizerSync = imports.linkedinSatellizerSync,
		linkedinSatellizerRegister = imports.linkedinSatellizerRegister,
		linkedinSatellizerLogin = imports.linkedinSatellizerLogin
		;
	router.post('/', linkedinSatellizer,
		function (req, res, next) {
			if (req.body.type && req.body.type.indexOf('register') != -1) {
				console.log("linkedinSatellizerRegister");
				return linkedinSatellizerRegister(req, res, next);
			}
			else if (req.body.type && req.body.type.indexOf('login') != -1) {
				console.log("linkedinSatellizerLogin");
				return linkedinSatellizerLogin(req, res, next);
			}
			else if (req.body.type == 'trainer-sync') {
				auth.authenticate()(req, res, function(){
					return linkedinSatellizerSync(req, res, next);
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
		authLinkedinRouter : router
	});
}
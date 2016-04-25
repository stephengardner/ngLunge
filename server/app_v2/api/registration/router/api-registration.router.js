'use strict';

var express = require('express');

module.exports = function setup(options, imports, register){
	var controller = imports.apiRegistrationController;
	var auth = imports.auth;//require('../../auth/auth.service');

	var router = express.Router();

	router.put('/:id/submit_password', auth.isValidRegistration(), controller.submitPassword);
	router.get('/', controller.index);
	router.get('/:id', controller.show);
	router.post('/', controller.create);
//router.get('/send_email', controller.sendEmail);
	router.get('/test/:email', controller.test);
	router.get('/:id/authenticate', controller.validateEmail);
	router.get('/getTrainerByAuthenticationHash/:id', controller.getTrainerByAuthenticationHash);

	register(null, {
		apiRegistrationRouter: router
	});
}
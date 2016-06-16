'use strict';

var express = require('express');

module.exports = function setup(options, imports, register){
	var controller = imports.apiRegistrationController,
		auth = imports.auth,
		bruteforce = imports.bruteforce
	;

	var router = express.Router();

	router.put('/:id/submit_password', auth.isValidRegistration(), controller.submitPassword);
	router.get('/', controller.index);
	router.get('/:id', controller.show);
	router.post('/', /*bruteforce.email.prevent,*/ controller.create);
	router.post('/resend', bruteforce.email.prevent, controller.resendEmail);
//router.get('/send_email', controller.sendEmail);
	router.get('/test/:email', controller.test);
	router.get('/:id/authenticate', controller.validateEmail);
	router.get('/:id/trainer', controller.getTrainerByAuthenticationHash);

	register(null, {
		apiRegistrationRouter: router
	});
}
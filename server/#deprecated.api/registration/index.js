'use strict';

var express = require('express');
module.exports = function createRouter(app){
	var controller = require('./registration.controller')(app);
	var auth = require('../../auth/auth.service')(app);

	var router = express.Router();

	router.put('/:id/submit_password', auth.isValidRegistration(), controller.submitPassword);
	router.get('/', controller.index);
	router.get('/:id', controller.show);
	router.post('/', controller.create);
//router.get('/send_email', controller.sendEmail);
	router.get('/test/:email', controller.test);
	router.get('/:id/authenticate', controller.validateEmail);
	router.get('/getTrainerByAuthenticationHash/:id', controller.getTrainerByAuthenticationHash);

	return router;
}
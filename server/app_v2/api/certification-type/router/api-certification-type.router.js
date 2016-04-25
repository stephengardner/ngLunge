'use strict';

var express = require('express');

module.exports = function setup(options, imports, register){
	var controller = imports.apiCertificationTypeController;//require('./certification-type.controller')(app);
	var auth = imports.auth;//require('../../auth/auth.service');

	var router = express.Router();
	router.get('/', controller.index);
	router.get('/:id', controller.show);
	router.post('/', controller.create);
	router.post('/verify', auth.isTrainerAuthenticated(), auth.isTrainerMe(), controller.upload);
	router.put('/verify', auth.isTrainerAuthenticated(), auth.isTrainerMe(), controller.upload);
	router.delete('/:id', controller.destroy);
	register(null, {
		apiCertificationTypeRouter : router
	});
}
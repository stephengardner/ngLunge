'use strict';

var express = require('express');

module.exports = function setup(options, imports, register){
	var controller = imports.apiCertificationOrganizaitonController;//require('./certification-organization.controller')(app);
	var auth = imports.auth;

	var router = express.Router();
	router.get('/', controller.index);
	router.put('/', controller.create);
	router.post('/', controller.create);
	router.get('/page', controller.showPage);
	router.get('/bySlug', controller.showBySlug);
	router.get('/search/:query', controller.search);
	router.get('/:id', controller.show);
	router.delete('/:id', controller.destroy);
	register(null, {
		apiCertificationOrganizationRouter : router
	});
}
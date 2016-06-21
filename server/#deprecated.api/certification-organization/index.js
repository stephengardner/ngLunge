'use strict';

var express = require('express');

module.exports = function(app){
	var controller = require('./certification-organization.controller')(app);
	var auth = require('../../auth/auth.service');

	var router = express.Router();
	router.get('/', controller.index);
	router.put('/', controller.create);
	router.post('/', controller.create);
	router.get('/bySlug', controller.showBySlug);
	router.get('/search/:query', controller.search);
	router.get('/:id', controller.show);
	router.delete('/:id', controller.destroy);
	return router;
}
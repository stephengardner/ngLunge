'use strict';

var express = require('express');


module.exports = function createRouter(app) {
	var controller = require('./certification.controller')(app);
	var auth = require('../../auth/auth.service')(app);
	var router = express.Router();

	router.get('/', controller.index);
	router.put('/:id', controller.update);
	router.put('/:id/addType', controller.addType);
	router.post('/:id/removeType', controller.removeType);
	router.post('/', controller.create);
	router.delete('/:id', controller.destroy);
	return router;
}
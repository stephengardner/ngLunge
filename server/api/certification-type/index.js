'use strict';

var express = require('express');

module.exports = function(app){
	var controller = require('./certification-type.controller')(app);
	var auth = require('../../auth/auth.service');

	var router = express.Router();
	router.get('/', controller.index);
	router.get('/:id', controller.show);
	router.post('/', controller.create);
	router.delete('/:id', controller.destroy);
	return router;
}
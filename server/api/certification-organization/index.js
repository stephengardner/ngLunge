'use strict';

var express = require('express');

module.exports = function(app){
	var controller = require('./certification-organizations.controller')(app);
	var auth = require('../../auth/auth.service');

	var router = express.Router();
	router.get('/', controller.index);
	router.get('/:id', controller.show);
	return router;
}
'use strict';

var express = require('express');


module.exports = function createRouter(app) {
	var controller = require('./specialty.controller')(app);
	var auth = require('../../auth/auth.service')(app);
	var router = express.Router();

	router.get('/', controller.index);
	router.get('/query/:query', controller.query);
	return router;
}
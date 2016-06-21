'use strict';

var express = require('express');


module.exports = function createRouter(app) {
	var controller = require('./activity.controller')(app);
	var auth = require('../../auth/auth.service')(app);
	var router = express.Router();

	router.get('/', controller.index);
	return router;
}
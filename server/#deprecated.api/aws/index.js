'use strict';

var express = require('express');

module.exports = function createRouter(app) {
	var controller = require('./aws.controller')(app);
	var auth = require('../../auth/auth.service')(app);
	var router = express.Router();

	router.post('/upload', controller.upload);
	router.put('/upload', controller.upload);
	router.post('/crop', controller.crop);
	return router;
}
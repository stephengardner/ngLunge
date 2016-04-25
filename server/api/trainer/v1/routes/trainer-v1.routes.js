'use strict';

var express = require('express');
var config = require('../../../../config/environment');
var _ = require("lodash");


// Extend the router
module.exports = function createRouter(app) {
	var router = express.Router();
	var v1Controller = require('../controllers/trainer-v1.controller')(app);
	var auth = require('../../../../auth/auth.service')(app);

	router.get('/page', v1Controller.showPage);

	return router;
}
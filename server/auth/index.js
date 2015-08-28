'use strict';

module.exports = function(app) {
	var express = require('express');
	var passport = require('passport');
	var config = require('../config/environment');
	var User = require('../api/user/user.model');
	//var Trainer = require('../api/trainer/trainer.model');
	var auth = require("./auth.service");

	var Trainer = app.models.Trainer;

// Passport Configuration
	require('./local/passport').setup(User, Trainer, config);
	require('./facebook/passport').setup(User, config);
	require('./google/passport').setup(User, config);
	require('./twitter/passport').setup(User, config);
	require('./linkedin/passport').setup(User, config);

	var router = express.Router();

	router.use('/local', require('./local')(app));

	router.use('/facebook', require('./facebook')(app));
	router.use('/twitter', require('./twitter')(app));
	router.use('/google', require('./google')(app));
	router.use('/linkedin', require('./linkedin')(app));


	return router;
}
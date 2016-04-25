'use strict';

var express = require('express');
var passport = require('passport');
var config = require('../../../config/environment');


module.exports = function setup(options, imports, register) {
	var User = imports.trainerModel;
	var authLocalPassport = imports.authLocalPassport,
		authFacebookRouter = imports.authFacebookRouter,
		authTwitterRouter = imports.authTwitterRouter,
		authLinkedinRouter = imports.authLinkedinRouter,
		authInstagramRouter = imports.authInstagramRouter
	;

	// Passport Configuration
	authLocalPassport.setup();
	//require('../../../auth/facebook/passport').setup(User, config);
	//require('../../../auth/google/passport').setup(User, config);
	//require('../../../auth/twitter/passport').setup(User, config);

	var router = express.Router();

	router.use('/local', imports.authLocalRouter);
	router.use('/facebook', authFacebookRouter);
	router.use('/twitter', authTwitterRouter);
	router.use('/linkedin', authLinkedinRouter);
	router.use('/instagram', authInstagramRouter);
	//router.use('/facebook', require('../../../auth/facebook')(MockApp));
	//router.use('/twitter', require('../../../auth/twitter')(MockApp));
	//router.use('/google', require('../../../auth/google')(MockApp));

	register(null, {
		authRoutes : router
	});
}
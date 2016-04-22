'use strict';

var express = require('express');
var passport = require('passport');
var config = require('../../../config/environment');


module.exports = function setup(options, imports, register) {
	var User = imports.userModel;

	// Passport Configuration
	require('../../../auth/local/passport').setup(User, config);
	require('../../../auth/facebook/passport').setup(User, config);
	require('../../../auth/google/passport').setup(User, config);
	require('../../../auth/twitter/passport').setup(User, config);

	var router = express.Router();
	var MockApp = {
		connections : imports.connections,
		config : config // this must be here because some models require config for grabbing Auth data...
	}

	router.use('/local', require('../../../auth/local')(MockApp));
	router.use('/facebook', require('../../../auth/facebook')(MockApp));
	router.use('/twitter', require('../../../auth/twitter')(MockApp));
	router.use('/google', require('../../../auth/google')(MockApp));

	register(null, {
		authRoutes : router
	});

	return router;
}
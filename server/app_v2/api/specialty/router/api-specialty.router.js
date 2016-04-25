'use strict';

var express = require('express');


module.exports = function setup(options, imports, register) {
	var controller = imports.apiSpecialtyController;
	var router = express.Router();

	router.get('/', controller.index);
	router.get('/query/:query', controller.query);

	register(null, {
		apiSpecialtyRouter : router
	});
}
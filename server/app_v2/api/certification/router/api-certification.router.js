'use strict';
var express = require('express');

module.exports = function setup(options, imports, register) {
	var auth = imports.auth;
	var controller = imports.apiCertificationController;
	var router = express.Router();

	router.get('/', controller.index);
	router.get('/:id', controller.show);
	router.put('/:id', controller.update);
	router.put('/:id/addType', controller.addType);
	router.post('/:id/removeType', controller.removeType);
	router.post('/', controller.create);
	router.delete('/:id', controller.destroy);

	register(null, {
		apiCertificationRouter : router
	});
}
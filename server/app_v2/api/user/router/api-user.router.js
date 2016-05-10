'use strict';
var express = require("express");

module.exports = function setup(options, imports, register) {
	var router = express.Router();
	var controller = imports.apiUserController;
	var auth = imports.auth;
	var bruteforce = imports.bruteforce;
	router.get('/', auth.hasRole('admin'), controller.index);
	router.delete('/:id', auth.hasRole('admin'), controller.destroy);
	router.get('/me', auth.isAuthenticated(), controller.me);
	router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
	router.get('/:id', auth.isAuthenticated(), controller.show);
	router.post('/', controller.create);

	register(null, {
		apiUserRouter : router
	});
};

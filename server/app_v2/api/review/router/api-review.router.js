'use strict';
var express = require("express");

module.exports = function setup(options, imports, register) {
	var router = express.Router();
	var controller = imports.apiReviewController;
	var auth = imports.auth;
	var bruteforce = imports.bruteforce;

	router.get('/', /*auth.hasRole('admin'),*/ controller.index);
	router.delete('/:id', /*auth.hasRole('admin'),*/ controller.delete);

	register(null, {
		apiReviewRouter : router
	});
};

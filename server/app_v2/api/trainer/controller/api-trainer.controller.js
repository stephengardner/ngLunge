var express = require("express");

module.exports = function setup(options, imports, register) {
	var router = express.Router();
	var controller = imports.apiTrainerController;

	register(null, {
		apiTrainerRouter : router
	})
}
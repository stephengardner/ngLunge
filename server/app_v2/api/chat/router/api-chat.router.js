'use strict';
var express = require("express");

module.exports = function setup(options, imports, register) {
	var router = express.Router();
	var controller = imports.apiChatController;
	var auth = imports.auth;
	var bruteforce = imports.bruteforce;
	router.get('/', controller.index);
	// router.delete('/:id', controller.destroy);
	router.get('/:id', /*auth.isAuthenticated(),*/ controller.show);
	router.get('/:id/info/:userId', /*auth.isAuthenticated(),*/ controller.getInfo);
	router.get('/:chatId/forUser/:userId', /*auth.isAuthenticated(),*/ controller.showForUser);
	// router.post('/', controller.create);

	register(null, {
		apiChatRouter : router
	});
};

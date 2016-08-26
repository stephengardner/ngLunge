'use strict';
var express = require("express");

module.exports = function setup(options, imports, register) {
	var router = express.Router();
	var controller = imports.apiUserController;
	var auth = imports.auth;
	var bruteforce = imports.bruteforce;
	router.get('/', auth.hasRole('admin'), controller.index);
	router.get('/byUrlName/:urlName', auth.isAuthenticated(), controller.show);
	router.delete('/:id', auth.hasRole('admin'), controller.destroy);
	router.get('/me', auth.isAuthenticated(), controller.me);
	router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
	router.get('/:id', auth.isAuthenticated(), controller.show);
	router.put('/:id', auth.isAuthenticated(), controller.update);
	router.post('/:id', auth.isAuthenticated(), controller.update);
	router.get('/:id/chat/send', /*auth.isAuthenticated(),*/ controller.sendMessage);
	router.get('/:id/chat/to/:recipientId', /*auth.isAuthenticated(),*/ controller.getOrCreateChatToRecipient);
	router.get('/:id/chat/notifications/read', /*auth.isAuthenticated(),*/ controller.readChatNotifications);
	router.post('/:id/messages/:messageId/read', /*auth.isAuthenticated(),*/ controller.readMessage);
	// router.get('/:id/chat/notifications/readSingle', /*auth.isAuthenticated(),*/ controller.readSingleChatNotification);
	router.get('/:id/chat', /*auth.isAuthenticated(),*/ controller.getChatPreview);
	router.post('/', controller.create);

	register(null, {
		apiUserRouter : router
	});
};

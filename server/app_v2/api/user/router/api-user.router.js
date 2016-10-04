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
	router.put('/:id/overwrite', auth.isAuthenticated(), controller.updateOverwrite);
	router.post('/:id', auth.isAuthenticated(), controller.update);
	// SUBMIT a review
	router.post('/:id/review', auth.isAuthenticated(), controller.submitReview);
	router.post('/:id/review/:reviewId/thank', auth.isAuthenticated(), controller.thankReview);
	router.post('/:id/review/:reviewId/unthank', auth.isAuthenticated(), controller.unthankReview);
	// get PAGES of reviews
	router.get('/:id/reviews', /*auth.isAuthenticated(),*/ controller.getReviewPage);
	// get review to another user
	router.get('/:id/review/:to', /*auth.isAuthenticated(),*/ controller.reviewByUserForUserGetter);
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

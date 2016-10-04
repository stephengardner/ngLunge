'use strict';

var passport = require('passport'),
	config = require('../../../../config/environment'),
	jwt = require('jsonwebtoken'),
	async = require('async')
	;

var validationError = function(res, err) {
	return res.json(422, err);
};

module.exports = function setup(options, imports, register) {
	var User = imports.userModel,
		chatNotificationReader = imports.chatNotificationReader,
		chatModel = imports.chatModel,
		chatPreviewGetter = imports.chatPreviewGetter,
		logger = imports.logger.info,
		chatGetter = imports.chatGetter
		;
	var exports = {};
	function handleError(res, err) {
		console.log("There was an error and logger should be outputting it...");
		logger.error(err);
		return res.send(500, err);
	}

	/**
	 * Get list of users
	 * restriction: 'admin'
	 */
	exports.index = function(req, res) {
		chatModel.find({}, function (err, users) {
			if(err) return res.send(500, err);
			res.json(200, users);
		});
	};
	/**
	 * Get a single user
	 */
	exports.show = function (req, res, next) {
		chatGetter.get(req.params.id).then(function(response){
			res.setHeader('X-Next-Max-Date', response.nextMaxDate);
			return res.json(response.data);
		}).catch(function(err){
			return handleError(res, err);
		});
		// chatModel.findById(req.params.id, function(err, user) {
		// 	if(err) return next(err);
		// 	if(!user) return res.send(401);
		// 	res.json(user);
		// });
	};

	exports.getInfo = function(req, res, next) {
		var chatId = req.params.id ? req.params.id.toString() : false;
		chatGetter.getInfo(chatId, req.params.userId.toString()).then(function(response){
			return res.status(200).json(response);
		}).catch(function(err) {
			return handleError(res, err);
		});
	};
	
	exports.showForUser = function (req, res, next) {
		var chatId = req.params.chatId ? req.params.chatId.toString() : false;
		chatGetter.get(chatId, req.params.userId.toString(), req.query.nextMaxDate).then(function(response){
			if(response.nextMaxDate)
				res.setHeader('X-Next-Max-Date', response.nextMaxDate);
			return res.status(200).json(response.data);
		}).catch(function(err){
			return handleError(res, err);
		});
		
		// chatModel.findById(req.params.id, function(err, user) {
		// 	if(err) return next(err);
		// 	if(!user) return res.send(401);
		// 	res.json(user);
		// });
	};

	register(null, {
		apiChatController : exports
	});
};
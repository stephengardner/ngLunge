'use strict';

var passport = require('passport'),
	config = require('../../../../config/environment'),
	jwt = require('jsonwebtoken'),
	async = require('async'),
	_ = require('lodash')
	;

var validationError = function(res, err) {
	return res.json(422, err);
};

module.exports = function setup(options, imports, register) {
	var User = imports.userModel,
		chatNotificationReader = imports.chatNotificationReader,
		chatModel = imports.chatModel,
		chatPreviewGetter = imports.chatPreviewGetter,
		chatSender = imports.chatSender,
		logger = imports.logger.info,
		chatMessageReadSetter = imports.chatMessageReadSetter,
		traineeModel = imports.traineeModel,
		chatGetter = imports.chatGetter
		;
	var exports = {};
	function handleError(res, err) {
		console.log("There was an error and logger should be outputting it...");
		logger.error(err);
		return res.status(500).json(err);
	}

	function getUser(req, res) {
		return new Promise(function(resolve, reject) {
			User.findById(req.params.id, function(err, user) {
				if(err) return reject(err);
				if(!user) return reject(401);
				return resolve(user);
			});
		})
	}
	/**
	 * Get list of users
	 * restriction: 'admin'
	 */
	exports.index = function(req, res) {
		User.find({}, '-salt -hashedPassword', function (err, users) {
			if(err) return res.send(500, err);
			res.json(200, users);
		});
	};
	
	exports.getOrCreateChatToRecipient = function(req, res) {
		getUser(req, res).then(function(gotUser){
			chatGetter.getByParticipantsOrCreate(gotUser._id, req.params.recipientId)
				.then(function(response){
				return res.json(response);
			}).catch(function(err){
				return handleError(res, err);
			})
		});
	};
	exports.sendMessage = function(req, res) {
		getUser(req, res).then(function(gotUser){
			var toChatId, message;
			toChatId = req.query.toChatId ? req.query.toChatId.toString() : false;
			message = req.query.message ? req.query.message.toString() : false;
			console.log("Sending to toChatId: ", toChatId, " message: ", message);
			if(!toChatId || !message) {
				return res.send(401);
			}
			chatSender.sendToChatId(gotUser, toChatId, message).then(function(response){
				console.log("response:", response);
				return res.json({message : 'message sent'});
			}).catch(function(err){
				handleError(res, err);
			});
			
			// chatSender.send(gotUser, to, message).then(function(response){
			// 	console.log("response:", response);
			// 	return res.json({message : 'message sent'});
			// }).catch(function(err){
			// 	handleError(res, err);
			// })
		})
	};

	/**
	 * Creates a new user
	 */
	exports.create = function (req, res, next) {
		var newUser = new User(req.body);
		newUser.provider = 'local';
		newUser.role = 'user';
		console.log("new user:", newUser);
		newUser.save(function(err, user) {
			if (err) return validationError(res, err);
			var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresIn: 60*5 /* 5 minutes */ });
			res.json({ token: token });
		});
	};

	exports.getChatPreview = function(req, res, next) {
		var user,
			gotChatPreview
			;
		async.waterfall([
			function findUser(callback) {
				getUser(req, res).then(function(response){
					user = response;
					callback();
				}).catch(callback);
			},
			function find(callback) {
				chatPreviewGetter.get(user).then(function(response){
					gotChatPreview = response;
					callback();
				}).catch(callback);
			}
		], function(err){
			if(err) return handleError(res, err);
			return res.json(gotChatPreview);
		})
		
	};

	exports.update = function(req, res, next) {
		if(req.body._id) { delete req.body._id; }
		if(req.body._v) { delete req.body._v; }
		if(req.body.__v) { delete req.body.__v; }
		var trainee = req.user;
		delete trainee.__v;
		if(!trainee) { return res.send(404); }

		if(req.body.name && req.body.name.full) {
			var nameFullParts = req.body.name.full.split(" ");
			req.body.name.first = nameFullParts[0];
			req.body.name.last = nameFullParts[1];
		}
		delete trainee.password;
		traineeModel.findById(trainee._id, function(err, found) {
			if(err) return handleError(res, err);
			for (var attrname in req.body) {
				console.log("updating " + attrname + " to: ", req.body[attrname]);
				found[attrname] = req.body[attrname];
				if(_.isEmpty(req.body[attrname])) {
					console.log(attrname + " is being DELETED");
					found[attrname] = undefined; // this WORKED for deleting a location
					found.markModified[attrname];
				}
			}
			console.log("found:", found);
			found.save(function(err, saved){
				console.log("Saved");
				if(err) return handleError(res, err);
				return res.json(saved);
			})
		});
	};
		
	exports.readChatNotifications = function(req, res, next) {
		var user,
			readNotifications
		;
		console.log("ReadChatnotifications req.query", req.query);
		async.waterfall([
			function findUser(callback) {
				getUser(req, res).then(function(response){
					user = response;
					callback();
				}).catch(callback);
			},
			function read(callback) {
				if(req.query.chatId) {
					chatNotificationReader.readSingle(user, req.query.chatId).then(function(response){
						readNotifications = response;
						callback();
					}).catch(callback);
				}
				else {
					chatNotificationReader.read(user).then(function(response){
						readNotifications = response;
						callback();
					}).catch(callback);
				}
			}
		], function(err){
			if(err) return handleError(res, err);
			return res.json({'read_notifications' : readNotifications});
		})
	};

	exports.readMessage = function(req, res, next) {
		User.findById(req.params.id, function(err, user) {
			if(err) return next(err);
			if(!user) return res.send(401);
			chatMessageReadSetter.set(req.params.messageId, req.params.id).then(function(response){
				// console.log("RESPONSE:", response);
				return res.json(response);
			}).catch(function(err){
				return handleError(res, err);
			});
			// res.json(user);
		});
	};
	/**
	 * Get a single user
	 */
	exports.show = function (req, res, next) {
		console.log("users show");

		var query = {};
		if(req.params.urlName) {query.urlName = req.params.urlName}
		else {query.id = req.query.id;}
		if(req.query.kind) {query.kind = req.query.kind}
		
		User.findOne(query, function(err, user) {
			if(err) return next(err);
			if(!user) return res.send(401);
			res.json(user);
		});
		/*
		 var userId = req.params.id;

		 User.findById(userId, function (err, user) {
		 if (err) return next(err);
		 if (!user) return res.send(401);
		 res.json(user.profile);
		 });
		 */
	};

	/**
	 * Deletes a user
	 * restriction: 'admin'
	 */
	exports.destroy = function(req, res) {
		User.findByIdAndRemove(req.params.id, function(err, user) {
			if(err) return res.send(500, err);
			return res.send(204);
		});
	};

	/**
	 * Change a users password
	 */
	exports.changePassword = function(req, res, next) {
		var userId = req.user._id;
		var oldPass = String(req.body.oldPassword);
		var newPass = String(req.body.newPassword);

		User.findById(userId, function (err, user) {
			if(user.authenticate(oldPass)) {
				user.password = newPass;
				user.save(function(err) {
					if (err) return validationError(res, err);
					res.send(200);
				});
			} else {
				res.send(403);
			}
		});
	};

	/**
	 * Get my info
	 */
	exports.me = function(req, res, next) {
		var userId = req.user._id;
		User.findOne({
			_id: userId
		}, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
			if (err) return next(err);
			if (!user) return res.json(401);
			res.json(user);
		});
	};

	/**
	 * Authentication callback
	 */
	exports.authCallback = function(req, res, next) {
		res.redirect('/');
	};

	register(null, {
		apiUserController : exports
	});
};
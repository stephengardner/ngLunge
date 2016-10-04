'use strict';

var passport = require('passport'),
	config = require('../../../../config/environment'),
	jwt = require('jsonwebtoken'),
	async = require('async'),
	_ = require('lodash'),
	moment = require('moment')
	;

var validationError = function(res, err) {
	return res.json(422, err);
};

module.exports = function setup(options, imports, register) {
	var userModel;
	var User = userModel = imports.userModel,
		chatNotificationReader = imports.chatNotificationReader,
		chatModel = imports.chatModel,
		chatPreviewGetter = imports.chatPreviewGetter,
		chatSender = imports.chatSender,
		reviewModel = imports.reviewModel,
		logger = imports.logger.info,
		reviewSubmitter = imports.reviewSubmitter,
		chatMessageReadSetter = imports.chatMessageReadSetter,
		traineeModel = imports.traineeModel,
		chatGetter = imports.chatGetter,
		trainerPopulatorCertificationsAggregated = imports.trainerPopulatorCertificationsAggregated,
		reviewByUserForUserGetter = imports.reviewByUserForUserGetter,
		locationTrainerParser = imports.locationTrainerParser,
		locationTrainerSaver = imports.locationTrainerSaver,
		locationSetter = imports.locationSetter
		;
	var exports = {};
	function handleError(res, err) {
		console.log("There was an error and logger should be outputting it...");
		logger.error(err);
		logger.info(err.errors);
		return res.status(500).json(err);
	}

	function getUser(req, res) {
		return new Promise(function(resolve, reject) {
			User.findById(req.params.id, function(err, user) {
				if(err) return handleError(res, err);
				if(!user) return handleError(res, 401);
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

	exports.getReviewPage = function(req, res) {
		var DEFAULTS = {
			nextMaxId : Infinity,
			itemsPerPage : 5
		};
		var nextMaxId = parseInt(req.query.nextMaxId) !== 0 ?
			(parseInt(req.query.nextMaxId) ?
				parseInt(req.query.nextMaxId) :
				DEFAULTS.nextMaxId)
			: 0;
		var itemsPerPage = parseInt(req.query.itemsPerPage) || DEFAULTS.itemsPerPage;
		if(itemsPerPage > 20)
			itemsPerPage = 20;
		var searchQuery = {};
		searchQuery._id = {
			$nin : req.query._ids || []
		};
		searchQuery.deleted = {
			$ne : true
		};
		searchQuery.to = req.params.id;

		var sortQuery = {
			created_at : -1
		};
		reviewModel.find(searchQuery)
			.limit(itemsPerPage)
			.populate({path : 'from', select : 'profile_picture name'})
			.sort(sortQuery).exec(function(err, reviews){
			if(err) { return handleError(res, err); }
			if(!reviews.length) { return res.json([]); }
			res.setHeader('X-Next-Max-Id', reviews[reviews.length-1].id -1);
			return res.json(200, reviews);
		})
	};

	exports.thankReview = function(req, res) {
		thankOrUnthankReview(req, res, true);
	};

	exports.unthankReview = function(req, res) {
		thankOrUnthankReview(req, res, false);
	};

	function thankOrUnthankReview(req, res, shouldThank) {
		var reviewId = req.params.reviewId,
			userId = req.params.id
		;
		if(!reviewId) return handleError(res, new Error('please include a reviewId'));
		if(!userId) return handleError(res, new Error('please include a userId'));
		reviewModel.findById(reviewId, function(err, review) {
			if(err) return handleError(res, err);
			var found = false,
				foundAtIndex
			;
			for(var i = 0; i < review.thanked_by.length; i++) {
				var thankedByAtIndex = review.thanked_by[i];
				if(thankedByAtIndex == userId) {
					found = true;
					foundAtIndex = i;
				}
			}
			if(shouldThank) {
				if(!found) {
					review.thanked_by.push(userId)
				}
			}
			else if(!shouldThank) {
				if(found) {
					review.thanked_by.splice(foundAtIndex, 1);
				}
			}
			review.save(function(err, saved) {
				saved.populate({path : 'from', select : 'profile_picture name ulrName kind'}, function(err, populated){
					if(err) return handleError(res, err);
					return res.status(200).json(populated);
				});
			})
		})
	}

	exports.submitReview = reviewSubmitter.submitAPI;

	exports.reviewByUserForUserGetter = reviewByUserForUserGetter.getAPI;

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

	exports.sendMessage = (req, res) => {
		getUser(req, res).then(function(gotUser){
			var toChatId, message;
			toChatId = req.query.toChatId ? req.query.toChatId.toString() : false;
			message = req.query.message ? req.query.message.toString() : false;
			if(!toChatId || !message) {
				return res.send(401);
			}
			chatSender.sendToChatId(gotUser, toChatId, message).then(() => {
				console.log(moment(new Date()));
				return res.status(200).json({message : 'message sent'});
			}).catch(function(err){
				handleError(res, err);
			});
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

	// Honestly, I'm not sure this is necessary.  It worked on plain update for locations array
	// even before i added the locationSetter.
	// IDK, maybe it's necessary.  Fuck
	exports.updateOverwrite = function(req, res, next) {
		console.log("----------\nUPDATEOVERWRITE");
		if(req.body._id) { delete req.body._id; }
		if(req.body.id) { delete req.body.id; } // um... sometimes this is "undefined"??? that's BAD
		if(req.body._v) { delete req.body._v; }
		if(req.body.__v) { delete req.body.__v; }
		var user = req.user;
		delete user.__v;
		if(!user) { return res.send(404); }

		if(req.body.name && req.body.name.full) {
			var nameFullParts = req.body.name.full.split(" ");
			req.body.name.first = nameFullParts[0];
			req.body.name.last = nameFullParts[1];
		}
		delete user.password;
		console.log("The req body:", req.body);
		userModel.findById(user._id, function(err, found) {
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
			console.log("Found.locations after all is:", found.locations);
			var setter = new locationSetter();
			setter.set(found);
			console.log('founds new main location: ', found.location);
			found.save(function(err, saved){
				if(err) return handleError(res, err);
				return res.json(saved);
			})
		});
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
		userModel.findById(trainee._id, function(err, found) {
			if(err) return handleError(res, err);
			for (var attrname in req.body) {
				console.log("updating " + attrname + " to: ", req.body[attrname]);
				found[attrname] = req.body[attrname];
				if(_.isObject(req.body[attrname]) && _.isEmpty(req.body[attrname])) {
					console.log(attrname + " is being DELETED");
					found[attrname] = undefined; // this WORKED for deleting a location
					found.markModified[attrname];
				}
			}
			var setter = new locationSetter();
			setter.set(found);
			console.log('founds new main location: ', found.location);
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
			if(user.kind == 'trainer') {
				trainerPopulatorCertificationsAggregated.get(user).then(function(response){
					res.json(response);
				}).catch(function(err) {
					handleError(res, err);
				});
			}
			else {
				res.json(user);
			}
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
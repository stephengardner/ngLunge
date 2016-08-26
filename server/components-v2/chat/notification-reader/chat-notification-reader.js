var async = require('async'),
	mongoose = require('mongoose')
	;

module.exports = function setup(options, imports, register) {
	var userPopulator = imports.userPopulator,
		chatModel = imports.chatModel,
		chatNotificationCounter = imports.chatNotificationCounter,
		logger = imports.logger.info,
		loggerType = 'chat-notification-reader'
		;
	var chatNotificationReader= {
		readAll : this.read,
		// ReadSingle is the exact same as readAll except we chatModel.find and specify a specific chatId THERE
		readSingle : function(user, chatId) {
			return new Promise(function(resolve, reject) {
				var populatedUser,
					readCount,
					newCount
					;
				async.waterfall([
					function populate(callback) {
						userPopulator.populate(user).then(function(response){
							populatedUser = response;
							callback();
						}).catch(callback);
					},
					function find(callback) {
						chatModel.find({
							'_id' : chatId,
							'participants.user' : mongoose.Types.ObjectId(populatedUser._id)
						},function(err, found){
							if(err) return callback(err);
							var countAltered = 0,
								isSingleDocumentAltered = false;
							async.each(found,
								function(item, icallback) {
									if(item.participants && item.participants.length) {
										isSingleDocumentAltered = false;
										for(var i = 0; i < item.participants.length; i++) {
											var participant = item.participants[i];
											if(populatedUser._id.equals(participant.user)) {
												if(participant.notification) {
													isSingleDocumentAltered = true;
													participant.notification = false;
												}
											}
										}
										if(isSingleDocumentAltered) {
											countAltered++;
										}
										item.save(function(err, saved) {
											if(err) return icallback(err);
											return icallback();
										})
									}
									else {
										icallback();
									}
								}, function(err){
									if(err) return callback(err);
									logger.info({ type : loggerType, msg : 'user ' + populatedUser._id + ' has ' +
									countAltered + ' notifications that we\'ve marked as read'});
									return callback();
								})
						});
					},
					function getNewCount(callback) {
						chatNotificationCounter.count(populatedUser).then(function(response){
							newCount = response;
							logger.info({type : loggerType, msg : 'setting counter newCount to:' + newCount});
							callback();
						}).catch(callback);
					},
					function updateUser(callback) {
						populatedUser.notifications.count.chat = newCount;
						populatedUser.save(function(err, saved){
							if(err) return callback(err);
							callback();
						})
					}
				], function(err, response){
					if(err) return reject(err);
					return resolve(readCount);
				})
			})
		},
		read : function(user) {
			var populatedUser,
				readCount,
				newCount
				;
			return new Promise(function(resolve, reject){
				async.waterfall([
					function populate(callback) {
						userPopulator.populate(user).then(function(response){
							populatedUser = response;
							callback();
						}).catch(callback);
					},
					function find(callback) {
						chatModel.find({
							'participants.user' : mongoose.Types.ObjectId(populatedUser._id)
						},function(err, found){
							if(err) return callback(err);
							var countAltered = 0,
								isSingleDocumentAltered = false;
							async.each(found,
								function(item, icallback) {
									if(item.participants && item.participants.length) {
										isSingleDocumentAltered = false;
										for(var i = 0; i < item.participants.length; i++) {
											var participant = item.participants[i];
											if(populatedUser._id.equals(participant.user)) {
												if(participant.notification) {
													isSingleDocumentAltered = true;
													participant.notification = false;
												}
											}
										}
										if(isSingleDocumentAltered) {
											countAltered++;
										}
										item.save(function(err, saved) {
											if(err) return icallback(err);
											return icallback();
										})
									}
									else {
										icallback();
									}
								}, function(err){
									if(err) return callback(err);
									logger.info({ type : loggerType, msg : 'user ' + populatedUser._id + ' has ' +
									countAltered + ' notifications that we\'ve marked as read'});
									return callback();
								})
						});
					},
					function getNewCount(callback) {
						chatNotificationCounter.count(populatedUser).then(function(response){
							newCount = response;
							logger.info({type : loggerType, msg : 'setting counter newCount to:' + newCount});
							callback();
						}).catch(callback);
					},
					function updateUser(callback) {
						populatedUser.notifications.count.chat = newCount;
						populatedUser.save(function(err, saved){
							if(err) return callback(err);
							callback();
						})
					}
				], function(err, response){
					if(err) return reject(err);
					return resolve(readCount);
				})
			})
		}
	};

	register(null, {
		chatNotificationReader : chatNotificationReader
	});
};
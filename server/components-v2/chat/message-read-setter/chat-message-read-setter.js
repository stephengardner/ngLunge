var async = require('async'),
	moment = require('moment'),
	mongoose = require('mongoose')
	;

module.exports = function setup(options, imports, register) {
	var chatModel = imports.chatModel,
		logger = imports.logger.info,
		loggerType = 'chat-message-read-setter',
		io = imports.socket
		;
	var chatMessageReadSetter = {
		set : function(messageId, userId) {
			var populatedUser,
				gotCount
				;
			return new Promise(function(resolve, reject) {
				var foundChat,
					savedChat,
					foundMessage,
					foundParticipant,
					foundMeta,
					seenAt = new Date(),
					chatPreviewGetter = imports.chatPreviewGetter
					;
				async.waterfall([
					function findChat(callback) {
						chatModel.findOne({"messages._id" : messageId}, function(err, response){
							if(err) return callback(err);
							foundChat = response;
							callback();
						});
					},
					function getParticipantItem(callback) {
						foundChat.participants.forEach(function(participantItem, participantIndex, participantArr) {
							if(participantItem.user == userId) {
								foundParticipant = participantItem;
							}
						});
						if(!foundParticipant) return callback(new Error('No participant item found for userID : ' + userId + ' on' +
							' chat id: ' + foundChat._id));
						return callback();
					},
					function getMessageToBeSeen(callback) {
						chatModel.aggregate([
							{
								$match : {
									'messages' : {
										$elemMatch : {
											'_id' : mongoose.Types.ObjectId(messageId)
										}
									}
								}
							},
							{
								$unwind : '$messages'
							},
							{
								$match : {
									'messages._id' : mongoose.Types.ObjectId(messageId)
								}
							},
							{
								$project : {
									'_id' : false,
									'message' : '$messages'
								}
							}
						], function(err, found){
							if(err) return callback(err);
							if(found && found[0] && found[0].message) {
								foundMessage = found[0].message;
							}
							else {
								return callback(new Error('No message found with id: ' + messageId));
							}
							callback();
						})
					},
					function getMetaItem(callback) {
						foundMessage.meta.forEach(function(metaItem, metaIndex, metaArr) {
							if(metaItem.user == userId) {
								foundMeta = metaItem;
							}
						});
						if(!foundMeta) return callback(new Error('No meta item found for userID : ' + userId + ' on' +
							' chat id: ' + foundChat._id));
						return callback();
					},
					function setParticipantsLastMessageSeen(callback) {
						foundParticipant.id_of_last_message_seen = foundMessage._id;
						callback();
					},
					function checkIfThisIsMostRecentMessageSeen(callback) {
						var previousSentTimeDoesntExist =
							!foundParticipant.sent_time_of_most_recent_message_seen,
							currentMessageSentTimeIsAfterPreviousMostRecentSentTime =
								moment(foundMessage.sent_at)
								.isAfter(foundParticipant.sent_time_of_most_recent_message_seen)
						;
						if(previousSentTimeDoesntExist || currentMessageSentTimeIsAfterPreviousMostRecentSentTime) {
							foundParticipant.sent_time_of_most_recent_message_seen = foundMessage.sent_at;
							foundParticipant.id_of_most_recent_message_seen = foundMessage._id;
						}
						callback();
					},
					function checkIfTheMostRecentMessageSentHasBeenSeen(callback) {
						chatModel.aggregate([
							{
								$match : {
									'messages.sent_at' : {
										$gt : foundMessage.sent_at
									}
								}
							},
							{
								$unwind : '$messages'
							},
							{
								$match : {
									'messages.sent_at' : {
										$gt : foundMessage.sent_at
									},
									'messages.meta' : {
										$elemMatch : {
											user : mongoose.Types.ObjectId(userId)
										}
									}
								}
							}
						], function(err, found){
							if(err) return callback(err);
							if(found && found[0] && found[0]) {
								callback();
							}
							else {
								foundParticipant.seen = true;
								foundParticipant.seen_at = seenAt;
								foundParticipant.final_message = {
									seen : true,
									seen_at : seenAt
								};
								callback();
							}
						});
					},
					function updateFoundParticipant(callback) {
						foundChat.participants.forEach(function(participantItem, participantIndex, participantArr) {
							if(participantItem._id == foundParticipant._id) {
								// console.log("Saving:", foundParticipant);
								participantArr[participantIndex] = foundParticipant;
							}
						});
						callback();
					},
					function updateMeta(callback) {
						foundMeta.read = true;
						foundMeta.seen_at = seenAt;
						foundMessage.meta.forEach(function(metaItem, metaIndex, metaArr) {
							if(metaItem.user == userId) {
								metaArr[metaIndex] = foundMeta;
							}
						});
						callback();
					},
					function saveChat(callback){
						chatModel.update({
							'_id' : foundChat._id,
							'participants.user' : mongoose.Types.ObjectId(userId)
						},{
							'participants.$' : foundParticipant
						}, function(err, updated){
							if(err) return callback(err);
							console.log("updated participant:", updated);
							callback();
						})
					},
					function saveChat(callback) {
						chatModel.update({
								'messages._id' : mongoose.Types.ObjectId(messageId)
							},
							{
								$set : {
									'messages.$': foundMessage
								}
							}, function(err, res){
								if(err) return callback(err);
								console.log(res);
								callback();
							});
					},
					function pushSocketEvent(callback){
						logger.info({
							type : loggerType,
							msg : 'emitting message to: ' + 'chat:' + foundChat._id + ':message-seen for all sockets' +
							' IN ' +
							' chat:' + foundChat._id});
						foundMessage.seen_at = foundMeta.seen_at;
						foundMessage.seen_at_time_formatted = moment(foundMeta.seen_at).format('h:mma');
						io.sockets
							.in('chat:' + foundChat._id)
							.emit('chat:' + foundChat._id + ':message-seen', foundMessage);
						callback();
					},
					function pushPreviewUpdaterSocketEvent(callback) {
						async.each(foundChat.participants, function(item, icallback) {
							var user = item.user;
							chatPreviewGetter.getSingle(user, foundChat._id)
								.then(function(response){
									io.sockets
										.in('user:auth:' + user)
										.emit('chat:message-preview-update', response[0])
										.emit('chat:' + foundChat._id + ':message-preview-update', response[0]);
									logger.info({
										type : loggerType,
										msg : 'pushing message-preview-update notification to user',
										user : user._id,
										message : response[0].message
									});
									icallback(null);
								}).catch(icallback);
						}, function(err, response){
							if(err) return callback(err);
							return callback();
						});
					}
				], function(err, response) {
					if(err) return reject(err);
					return resolve(savedChat);
				});
			})
		}
	};

	register(null, {
		chatMessageReadSetter : chatMessageReadSetter
	});
};
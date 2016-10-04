'use strict';

var async = require('async'),
	_ = require('lodash'),
	mongoose = require('mongoose'),
	moment = require('moment'),
	config = require('../../../config/environment');
;
module.exports = function setup(options, imports, register) {
	var chatModel = imports.chatModel,
		userModel = imports.userModel,
		logger = imports.logger.info,
		loggerType = 'chat-getter'
		;
	var chatGetter = {

		getInfo : function(chatId, userId) {
			return new Promise(function(resolve, reject) {
				var redact = {
						$redact : {
							$cond : {
								if : {
									$and : [
										{
											$eq : [
												'$user', mongoose.Types.ObjectId(userId)
											]
										}
									]
								},
								then : "$$PRUNE",
								else : "$$DESCEND"
							}
						}
					},
					pipeline = [
						{
							$match : {
								'_id': mongoose.Types.ObjectId(chatId)
							}
						},
						redact
					];


				chatModel.aggregate(pipeline, function(err, response){
					if(err) return reject(err);
					if(!response || !response[0]) return reject(404);
					var returnObject = {};
					var firstResponse = response[0];
					var hasOtherParticipants = false;
					if(firstResponse.participants && firstResponse.participants.length) {
						firstResponse.participants.forEach(function(item, index, arr) {
							if(item.user) {
								hasOtherParticipants = true;
							}
						})
					}
					if(!hasOtherParticipants) {
						returnObject.non_group_message_reply_to_user = userId
					}
					else if(response[0] && response[0].participants && response[0].participants[0]) {
						returnObject.non_group_message_reply_to_user = response[0].participants[0].user
					}
					return resolve(returnObject);
				})
			});
		},

		getByParticipantsOrCreate : function(user1, user2) {
			return new Promise(function(resolve, reject) {
				var foundChat,
					parsedChatAfterFound,
					savedNewChat
					;
				if(!user1) {
					return reject(new Error('include a first user for this endpoint'));
				}
				if(!user2) {
					return reject(new Error('include a second user for this endpoint'));
				}
				async.waterfall([
					function findUserOne(callback) {
						userModel.findById(user1, function(err, found){
							if(err) return reject(err);
							if(!found) return callback(new Error('user ' + user1 + ' does not exist'));
							callback();
						})
					},
					function findUserTwo(callback) {
						userModel.findById(user2, function(err, found){
							if(err) return reject(err);
							if(!found) return callback(new Error('user ' + user2 + ' does not exist'));
							callback();
						})
					},
					function findConvo(callback) {
						if(user1 == user2) { // sending message to self
							chatModel.findOne({
								$and : [
									{
										'participants' : { $size : 1 }
									},
									{
										'participants' : {
											$elemMatch : {
												'user' : mongoose.Types.ObjectId(user1)
											}
										}
									}
								]
							}, function(err, response) {
								if(err) return callback(err);
								foundChat = response;
								callback();
							})
						}
						else { // sending message to someone else
							chatModel.findOne({
								$and : [
									{
										'participants' : { $size : 2 }
									},
									{
										'participants' : {
											$elemMatch : {
												'user' : mongoose.Types.ObjectId(user1)
											}
										}
									},
									{
										'participants' : {
											$elemMatch : {
												'user' : mongoose.Types.ObjectId(user2)
											}
										}
									}
								]
							}, function(err, response) {
								if(err) return callback(err);
								foundChat = response;
								callback();
							})
						}
					},
					function getOrCreate(callback) {
						if(foundChat) {
							callback();
						}
						else{
							var participants,
								to_self
							;
							if(user1 != user2) {
								participants = [
									{
										user : user1
									},
									{
										user : user2
									}
								]
							}
							else {
								participants = [
									{
										user : user1
									}
								];
								to_self = true;
							}
							var newChat = {
								to_self : to_self,
								participants : participants,
								started_by : user1
							};
							console.log("newchat:", newChat);
							var createdChat = new chatModel(newChat);
							createdChat.save(function(err, saved){
								if(err) return callback(err);
								savedNewChat = saved;
								callback();
							});
						}
					}
				], function(err, response){
					if(err) return reject(err);
					if(foundChat) {
						return resolve(foundChat._id);
					}
					else {
						if(savedNewChat) {
							return resolve(savedNewChat._id)
						}
						else {
							return reject(404);
						}
					}
				})
			})
		},
		get : function(chatId, userId, maxDate) {
			return new Promise(function(resolve, reject) {
				var gotMessages,
					gotObject, // alias for gotMessages
					idOfMessageToShowSeenAt,
					timeToShowSeenAt,
					foundChat,
					returnObject = {
						nextMaxDate : new Date('2030-01-01'),
						data : []
					}
					;
				maxDate = maxDate || new Date('2030-01-01');
				//maxDate = new Date("07/27/2016");
				var secondMatch;
				var parsedMaxDate = new Date(maxDate);//new moment(new Date(maxDate)).toDate();
				// if(maxDate) {
				secondMatch = {
					$match : {
						'messages.sent_at' : {
							$lte : parsedMaxDate,
							$exists : true
						}
					}
				};
				async.waterfall([
					function validate(callback) {
						if(!mongoose.Types.ObjectId.isValid(chatId)){
							logger.info({type : loggerType, msg : 'chatId is not valid: ' + chatId});
							return callback(404);
						}
						if(!mongoose.Types.ObjectId.isValid(userId)){
							logger.info({type : loggerType, msg : 'userId is not valid: ' + userId});
							return callback(404);
						}
						callback();
					},
					function getTheChatIDWhichWillHaveTheSeenAtStringBeneathIt(callback) {
						chatModel.findById(chatId, function(err, chat) {
							if(err) return callback(err);
							foundChat = chat;
							if(!chat || !chat.participants || !chat.participants.length) {
								logger.info({type : loggerType, msg : 'chat does not exist or has no participants'});
								return callback(404);
							}
							if(chat.last_message_sent_by == userId) {
								chat.participants.forEach(function(participant, participantIndex, participantArr){
									if(participant.user != userId) {
										idOfMessageToShowSeenAt = participant.id_of_most_recent_message_seen;
										timeToShowSeenAt = participant.seen_at;
									}
								});
							}
							callback();
						})
					},
					function getChat(callback) {
						var matchObject = {
							$match : {
								'_id' : mongoose.Types.ObjectId(chatId),
								'participants' : {
									$elemMatch : {
										'user' : mongoose.Types.ObjectId(userId)
									}
								}
							}
						};
						var pipelineFirst = [
								matchObject,
								{
									$unwind : '$messages'
								},
								secondMatch,
								{
									$sort : { 'messages.sent_at' : -1 }
								},
								{
									$limit : 10
								}
							],
							pipelineSecond = [
								{
									$redact : {
										$cond : {
											if : {
												$and : [
													{
														$eq : ['$user', mongoose.Types.ObjectId(userId) ]
													},
													{
														$eq : ['notification', null]
													}
												]
											},
											then : "$$PRUNE",
											else : "$$DESCEND"
										}
									}
								},
								{
									$group : {
										_id: {
											year: {$year: "$messages.sent_at"},
											month: {$month: "$messages.sent_at"},
											day: {$dayOfMonth: "$messages.sent_at"}
										},
										max_date : { $max : '$messages.sent_at' },
										next_max_date : { $min : '$messages.sent_at' },
										messages : {
											$push : '$messages'
										},
										participants : {
											$first : '$participants'
										}
									}
								},
								// sort in descending order, get NEWEST FIRST
								{
									$sort : {'_id.year' : -1, '_id.month' : -1, '_id.day' : -1 }
								}
							];

						var pipeline = pipelineFirst.concat(pipelineSecond);

						chatModel.aggregate(
							pipeline,
							function(err, response) {
								if(err) return callback(err);
								if(!response /*|| !response[0] || !response[0].participants*/) {
									logger.info({type : loggerType, msg : 'response is empty ', response: response});
									return callback(404);
								}
								gotObject = response[0];
								gotMessages = response;
								// console.log("GOTMESSAGES:", gotMessages[0].messages);
								callback();
							})
					},
					// function markTheLastMessageSeen(callback) {
					// 	if (gotMessages && gotMessages.length) {
					// 		gotMessages.forEach(function (aggregatedByDate, index, arr) {
					// 			console.log(aggregatedByDate);
					// 		})
					// 	}
					// 	callback();
					// },
					function setTrueIfSeenByUser(callback) {
						if (gotMessages && gotMessages.length) {
							gotMessages.forEach(function (aggregatedByDate, index, arr) {
								if (aggregatedByDate.messages && aggregatedByDate.messages.length) {
									aggregatedByDate.messages.forEach(function (message, messageIndex, messagesArr) {
										if (message.meta && message.meta.length >= 1) {
											message.meta.forEach(function (metaItem, metaIndex, metaArr) {
												if(metaItem.user != message.sender && metaItem.seen_at) {
													message.seen_at = metaItem.seen_at;
													message.seen_at_time_formatted =
														moment(metaItem.seen_at).format('h:mma');
												}
												if (metaItem.user == userId && !metaItem.read) {
													logger.info({
														type : loggerType,
														msg : 'retrieved an unseen message, we\'ll ping the server' +
														' when it\'s seen',
														message : message.message
													});
													// check if this message was to themselves
													if(!foundChat.to_self) {
														message.sendEventWhenSeen = true;
													}
												}
											});
										}
										if (message.sendEventWhenSeen !== true) {
											message.sendEventWhenSeen = false;
										}
										messagesArr[messageIndex] = message;
									});
								}
							});
						}
						callback();
					},
					function populateAndTransform(callback) {
						if(gotMessages && gotMessages.length) {
							gotMessages.forEach(function(item, index, arr) {
								item.day = item._id.day;
								item.month = item._id.month;
								item.year = item._id.year;

								if(item.participants && item.participants.length) {
									item.non_group_message_reply_to_user = item.participants[0].user;
								}

								if(new moment().diff(item.max_date, 'days') >= 1) {
									item.date_formatted = new moment(item.max_date).format('MMM DD');
								}
								else {
									item.date_formatted = 'Today';
								}
								// set sent at and seen at if necessary
								if(item.messages && item.messages.length) {
									item.messages.forEach(function(message, index, arr) {
										message.sent_at_time_formatted = moment(message.sent_at).format('h:mma');
									})
								}
								item.internal_client_key = item.day + '-' + item.month + '-' + item.year;
								arr[index] = item;
							});
							userModel.populate(gotMessages,
								{
									path : 'messages.sender participants.user',
									select : '_id name profile_picture urlName color'
								},
								function(err, populated) {
									if(err) return callback(err);
									returnObject.nextMaxDate = gotMessages[gotMessages.length - 1].next_max_date;
									populated.forEach(function(item, index, arr) {
										if(item.messages && item.messages.length) {
											item.messages.forEach(function(message, messageIndex, messagesArr) {
												if(message.sender) {
													var senderProfileUrl = config.DOMAIN + '/';
													if(message.sender.kind == 'trainee') {
														senderProfileUrl += 'user/';
													}
													senderProfileUrl += message.sender.urlName;
													message.sender_profile_url = senderProfileUrl;
												}
												// message.sender_u = config.DOMAIN + '/' + message.sender.urlName;
											})
										}
										item.userForThumbnail = item.participants[0].user;
										// item.sender_profile_url = config.domain + item.participants[0].user.urlName;
										arr[index] = item;
									});
									returnObject.data = gotMessages;
									callback();
								})
						}
						else {
							callback();
						}
					}
				], function(err){
					if(err) return reject(err);
					return resolve(returnObject);
				})
			})
		}
	};
	register(null, {
		chatGetter : chatGetter
	})
};
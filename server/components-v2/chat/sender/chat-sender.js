var async = require('async'),
	_ = require('lodash'),
	mongoose = require('mongoose'),
	moment = require('moment'),
	config = require('../../../config/environment');
;
module.exports = function setup(options, imports, register) {
	var userPopulator = imports.userPopulator,
		chatModel = imports.chatModel,
		logger = imports.logger.info,
		loggerType = 'chat-sender',
		io = imports.socket,
		chatNotificationCounter = imports.chatNotificationCounter,
		chatPopulator = imports.chatPopulator
		;
	var chatSender = {
		sendToChatId : function(from, toChatId, message) {
			return new Promise(function(resolve, reject){
				var gotFrom, gotChat, chatMessage, mongooseRetrievedSpecificChatItem,
				toUsers = []
				;
				logger.info({
					type : loggerType,
					msg : 'sendToChatId()'
				});
				async.waterfall([
					function getFrom(callback) {
						populate(from).then(function(response){
							console.log("from:", response.name);
							gotFrom = response;
							callback();
						}).catch(callback);
					},
					function populateChat(callback){
						chatPopulator.populate(toChatId).then(function(response){
							gotChat = response;
							callback();
						}).catch(callback);
					},
					// function get(callback) {
					// 	getChat(gotFrom, gotTo).then(function(response){
					// 		gotChat = response;
					// 		callback();
					// 	}).catch(callback);
					// },
					function modifyChat(callback) {
						chatMessage = {
							message : message,
							sender : gotFrom._id,
							sent_at : new moment(),
							meta : []
						};
						gotChat.last_message_sent_at = new Date();
						gotChat.participants.forEach(function(item, index, arr) {
							// console.log("item.user is:", item.user._id, " and gotFrom._id is:", gotFrom._id);
							// send notification to user if the participant is NOT the sender
							if(!gotFrom) {
								console.log("GotFrom doesn't exist");
							}
							if(!item.user) {
								console.log("item.user doesn't exist, this means that the user was deleted from this" +
									" chat", item);
							}
							if(!(gotFrom._id.equals(item.user._id))) {
								toUsers.push(item.user); // this is a populated user
								item.notification = true;
								item.read = false;
								arr[index] = item;
								var toMeta = {
									user : item.user._id,
									delivered : false,
									read : false
								};
								chatMessage.meta.push(toMeta);
								console.log("")
							}
						});
						gotChat.messages.push(chatMessage);
						logger.info({
							type : loggerType,
							chatMessage : chatMessage.message
						});
						callback();
					},
					function saveChat(callback) {
						gotChat.save(function(err, saved){
							if(err) return callback(err);
							logger.info({ type : loggerType, msg : 'saved'});
							mongooseRetrievedSpecificChatItem = saved.messages[saved.messages.length - 1];
							return callback();
						})
					},
					function modifyUser(callback) {
						async.eachSeries(toUsers, function(user, icallback) {
							// opted not to go this route...
							// Someone might be logged in to the chat room on another device and not notice the
							// notification on their current device
							// console.log("Getting clients by room: chat:" + gotChat._id);
							// var clientsInThisChatRoom = io.get_clients_by_room('chat:' + gotChat._id);
							// for(var i = 0; i < clientsInThisChatRoom.length; i++) {
							// 	var client = clientsInThisChatRoom[i];
							// 	if(client && client.decoded_token) {
							// 		console.log("Client decoded token: ", client.decoded_token);
							// 		if(user._id.equals(client.decoded_token._id)){
							// 			console.log("NOT SENDING A NOTIFICATION BECAUSE THEY'RE ALREADY IN THE CHAT" +
							// 				" ROOM");
							// 		}
							// 	}
							// }
							logger.info({
								type : loggerType,
								msg : 'about to count the notifications'
							});
							chatNotificationCounter.count(user).then(function(gotCount) {
								logger.info({
									type : loggerType,
									msg : 'setting chat notification count to : ' +
									gotCount + ' for user ' +
									user._id
								});
								user.notifications.count.chat = gotCount;
								user.save(function(err, saved) {
									logger.info({
										type : loggerType,
										msg : 'user saved',
										user : user._id
									});
									if(err) return icallback(err);
									return icallback();
								})
							}).catch(callback);
						}, function(err){
							if(err) return callback(err);
							return callback();
						});
					},
					function pushSocketEvent(callback){
						// for(var i = 0; i < toUsers.length; i++) {
						// 	var user = toUsers[i];
						// 	// io.sockets.in('user:auth:' + user._id).emit('message', chatMessage);
						// }
						logger.info({
							type : loggerType,
							msg : 'emitting message to: ' + 'chat:' + gotChat._id + ':message for all sockets IN ' +
								' chat:' + gotChat._id});
						
						var gotFromToObject = gotFrom.toObject();
						var chatMessageToSendThroughSocket = {
							_id : mongooseRetrievedSpecificChatItem._id,
							sent_at_time_formatted : new moment(new Date()).format('h:mma'),
							message : mongooseRetrievedSpecificChatItem.message,
							sender : {
								_id : gotFrom._id,
								name : gotFromToObject.name,
								profile_picture : gotFrom.profile_picture,
							}
						};
						var senderProfileUrl = config.DOMAIN + '/';
						if(gotFrom.kind == 'trainee') {
							senderProfileUrl += 'user/';
						}
						senderProfileUrl += gotFrom.urlName;
						chatMessageToSendThroughSocket.sender_profile_url = senderProfileUrl;

						io.sockets
							.in('chat:' + gotChat._id)
							.emit('chat:' + gotChat._id + ':message', chatMessageToSendThroughSocket);
						callback();
					}
				], function(err, response){
					if(err) return reject(err);
					return resolve();
				})
			})
		},
		send : function(from, to, message) {
			return new Promise(function(resolve, reject){
				var gotFrom, gotTo, gotChat, chatMessage
					;
				async.waterfall([
					function getFrom(callback) {
						populate(from).then(function(response){
							console.log("from:", response.name);
							gotFrom = response;
							callback();
						}).catch(callback);
					},
					function getTo(callback){
						populate(to).then(function(response){
							console.log("to:", response.name);
							gotTo = response;
							callback();
						}).catch(callback);
					},
					// function get(callback) {
					// 	getChat(gotFrom, gotTo).then(function(response){
					// 		gotChat = response;
					// 		callback();
					// 	}).catch(callback);
					// },
					// function modifyChat(callback) {
					// 	chatMessage = {
					// 		message : message,
					// 		sender : gotFrom._id,
					// 		sent_at : new moment(),
					// 		meta : []
					// 	};
					// 	var toMeta = {
					// 		user : gotTo._id,
					// 		delivered : false,
					// 		read : false
					// 	};
					// 	gotChat.last_message_sent_at = new Date();
					// 	gotChat.participants.forEach(function(item, index, arr) {
					// 		// console.log("Checking item.user...", item.user);
					// 		if(gotTo._id.equals(item.user)) {
					// 			// console.log("FOUND IT");
					// 			item.notification = true;
					// 			item.read = false;
					// 			arr[index] = item;
					// 		}
					// 	});
					// 	chatMessage.meta.push(toMeta);
					// 	gotChat.messages.push(chatMessage);
					// 	callback();
					// },
					// function saveChat(callback) {
					// 	gotChat.save(function(err, saved){
					// 		if(err) return callback(err);
					// 		logger.info({ type : loggerType, msg : 'saved'});
					// 		return callback();
					// 	})
					// },
					// function modifyUser(callback) {
					// 	chatNotificationCounter.count(gotTo).then(function(gotCount){
					// 		logger.info({ type : loggerType, msg : 'setting chat notification count to : ' + gotCount + ' for user ' + gotTo._id});
					// 		gotTo.notifications.count.chat = gotCount;
					// 		callback();
					// 	}).catch(callback);
					// },
					// function saveUser(callback) {
					// 	gotTo.save(function(err, saved) {
					// 		if(err) callback(err);
					// 		// gotTo = saved;
					// 		callback();
					// 	})
					// },
					// function pushSocketEvent(callback){
					// 	logger.info({
					// 		type : loggerType,
					// 		msg : 'emitting message to: ' + 'user:auth:' + gotTo._id
					// 	});
					// 	io.sockets.in('user:auth:' + gotTo._id).emit('message', chatMessage);
					// 	callback();
					// }
					function get(callback) {
						console.log("Sending message from: " + gotFrom._id + " to: " + gotTo._id);
						getChat(gotFrom, gotTo).then(function(response) {
							gotChat = response;
							callback();
						}).catch(callback);
					},
					function send(callback) {
						chatSender.sendToChatId(gotFrom, gotChat._id, message).then(function(response){
							callback();
						}).catch(callback);
					}
				], function(err, response){
					if(err) {
						logger.error(err);
						return reject(err);
					}
					return resolve();
				})
			})
		}
	};
	function getChat(gotFrom, gotTo) {
		return new Promise(function(resolve, reject) {
			// console.log("Getting chat from:", gotFrom, " to : ", gotTo);
			var gotChat
				;
			async.waterfall([
				function getChat(callback) {
					logger.info({
						type : loggerType,
						msg : 'finding chat using users (from:)' + gotFrom._id + " (to:)" + gotTo._id
					});
					chatModel.findOne({
						$or : [
							{
								started_by : gotFrom._id,
								// $elemMatch : {
								"participants.user": gotTo._id
								// }
							},
							{
								started_by : gotTo._id,
								// $elemMatch : {
								"participants.user" : gotFrom._id
								// }
							}
						]
					}).exec(function(err, found){
						if(err) return callback(err);
						if(!found) return callback(null, 404);
						gotChat = found;
						callback(null, null);
					})
				},
				function createChatIfNecessary(code, callback) {
					// console.log("Code:", code);
					// console.log("GotChat:", gotChat);
					if(code == 404) {
						console.log("Creating new chat");
						var chatObj = {
							started_by : gotFrom._id,
							participants : []
						};
						chatObj.participants.push({
							user : gotFrom._id,
							delivered : false,
							read : false,
							last_seen : new Date()
						});
						chatObj.participants.push({
							user : gotTo._id,
							delivered : false,
							read : false,
							last_seen : undefined
						});
						var newChat = new chatModel(chatObj);
						newChat.save(function(err, saved){
							if(err) return callback(err);
							logger.info({
								type : loggerType,
								msg : 'created chat',
								chatId : saved._id
							});
							gotChat = saved;
							return callback();
						})
					}
					else {
						return callback();
					}
				}
			], function(err){
				if(err) return reject(err);
				return resolve(gotChat);
			});
		})
	}
	function populate(doc) {
		return new Promise(function(resolve, reject){
			userPopulator.populate(doc).then(resolve).catch(reject);
		})
	}
	register(null, {
		chatSender : chatSender
	});
};
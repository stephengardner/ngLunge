var async = require('async'),
	mongoose = require('mongoose'),
	moment = require('moment'),
	_ = require('lodash')
	;
module.exports = function setup(options, imports, register) {
	var chatModel = imports.chatModel,
		userPopulator = imports.userPopulator,
		userModel = imports.userModel,
		logger = imports.logger.info,
		loggerType = 'chat-preview-getter'
		;
	var chatPreviewGetter = {
		getSingle : function(user, chatId) {
			return this.get(user, { singleChatId : chatId });
		},
		get : function(user, options) {
			return new Promise(function(resolve, reject){
				var populatedUser,
					aggregatedChats,
					DEFAULTS = {}
					;
				options = _.merge({}, options, DEFAULTS);
				async.waterfall([
					function populate(callback){
						userPopulator.populate(user).then(function(response){
							populatedUser = response;
							populatedUserId = mongoose.Types.ObjectId(response._id);
							if(!response) {
								return callback(404);
							}
							callback();
						}).catch(callback);
					},
					function aggregate(callback) {
						var firstMatch;
						if(options.singleChatId) {
							firstMatch = {
								$match : {
									'_id' : options.singleChatId
								}
							}
						}
						else {
							firstMatch = {
								$match : {
									'participants.user' : populatedUserId
								}
							};
						}
						chatModel.aggregate([
							firstMatch,
							{
								$unwind : '$participants'
							},
							// Get all the participants, and omit the current user in question
							// We do this so that later down the road we have a document who's participant list
							// doesn't include him/her, so that we can then populate on participants and create an
							// accurate title for this chat
							{
								$match : {
									$or : [
										{
											'participants.user' : {
												$ne : populatedUserId
											}
										},
										{
											'participants.user' : {
												$eq : populatedUserId
											},
											'started_by' : {
												$eq : populatedUserId
											}
										}
									]
								}
							},
							// Basically, this is rewinding after the participants unwinding
							{
								$group : {
									'_id': '$_id',
									'participants': {$push: '$participants'},
									'to_self' : { $last : '$to_self' },
									'messages': {$last: '$messages'},
									'is_group_message' : {$last : '$is_group_message'},
									'chat_type' : {$last : '$chat_type'},
									'last_message_sent_at' : {$last : '$last_message_sent_at'}
								}
							},

							// We want to get all unread messages count... However, this chat object is between many
							// users,
							// and the unread status is within the meta array within the messages array.
							// we unwind both of these, then group directly on the messages.meta.delivered status
							{
								$unwind : '$messages'
							},
							{
								$sort : {
									'messages.sent_at' : 1
								}
							},
							{
								$unwind : '$messages.meta'
							},
							{
								$sort : {
									'messages.sent_at' : 1
								}
							},
							// perhaps the trickiest part.  Group by the messages.meta.delivered
							// we save the message, the sender, and the meta, so that we can rewind this all
							// together again
							{
								$group : {
									'_id': '$messages._id',
									'parent_id' : {$first : '$_id'},
									'to_self' : { $first : '$to_self' },
									'sent_at' : { $first : '$messages.sent_at' },
									'message' : {$first : '$messages.message'},
									'sender' : {$first : '$messages.sender'},
									'meta' : {$push : '$messages.meta'},
									// testing
									'unread': {
										$sum: {
											$cond: [
												{
													$and : [
														{
															$ne : [ '$to_self', true ],
														},
														{
															$eq: [
																'$messages.meta.read',
																false
															]
														},
														{
															$eq: [
																'$messages.meta.user',
																populatedUser._id
															]
														}
													]
												},
												1,
												0
											]
										}
									},
									'participants': {$first : '$participants'},
									'is_group_message' : {$last : '$is_group_message'},
									'chat_type' : {$last : '$chat_type'},
									'last_message_sent_at' : {$last : '$last_message_sent_at'}
								}
							},
							{
								$sort : {
									'sent_at' : 1
								}
							},
							// here, we're restructuring the meta/sender/message to be under a "messages" object
							// before rewinding all the "message"s into a "messages" array
							{
								$project : {
									'_id' : '$parent_id',
									'to_self' : '$to_self',
									'message' : {
										sent_at : '$sent_at',
										meta : '$meta',
										sender : '$sender',
										content : '$message'
									},
									'unread' : '$unread',
									'participants' : '$participants',
									'is_group_message' : '$is_group_message',
									'last_message_sent_at' : '$last_message_sent_at'
								}
							},
							// rewind
							{
								$group : {
									'_id': '$_id',
									'to_self' : { $first : '$to_self' },
									'messages' : {$push : '$message'},
									'unread_count': {
										$sum: '$unread'
									},
									'participants': {$first : '$participants'},
									'is_group_message' : {$last : '$is_group_message'},
									'chat_type' : {$last : '$chat_type'},
									'last_message_sent_at' : {$last : '$last_message_sent_at'}
								}
							},
							{
								$sort : {
									'messages.sent_at' : 1
								}
							},
							// project the final outcome
							{
								$project: {
									'participants' : '$participants',
									'to_self' : '$to_self',
									'unread_count' : '$unread_count',
									'last_message' : {
										$slice : ['$messages', -1]
									},
									'last_message_text' : {
										$slice : ['$messages.content', -1]
									},
									'last_message_sender' : {
										$slice : ['$messages.sender', -1]
									},
									'last_message_sent_at' : '$last_message_sent_at',
									'chat_type' : '$chat_type',
									'is_group_message' : '$is_group_message'
								}
							},
							// removing myself from the array of participants so that we can construct
							// the proper image by just grabbing the first participant from the array
							// {
							// 	$redact : {
							// 		$cond : {
							// 			if : {
							// 				$and : [
							// 					{
							// 						$eq : [
							// 							'$to_self', null
							// 						]
							// 					},
							// 					{
							// 						$eq : [
							// 							'$user', populatedUserId
							// 						]
							// 					},
							// 					{
							// 						$ne : [ 'kind' , null ]
							// 					}
							// 				]
							// 			},
							// 			then : "$$PRUNE",
							// 			else : "$$DESCEND"
							// 		}
							// 	}
							// },
							{
								$sort : {
									'last_message_sent_at' : -1
								}
							}
						], function(err, response){
							if(err) return callback(err);
							userModel.populate(response,
								{'path' : 'last_message_sender', 'select' : '_id name profile_picture'},
								function(err, populated){
									if(err) return callback(err);
									aggregatedChats = [];
									if(populated) {
										populated.forEach(function(item, index, arr) {
											item.last_message = item.last_message
											&& item.last_message.length
												? item.last_message[0]
												: '';
											item.last_message_text = item.last_message_text
											&& item.last_message_text.length
												? item.last_message_text[0]
												: '';
											item.last_message_sender = item.last_message_sender
											&& item.last_message_sender.length
												? item.last_message_sender[0]
												: undefined;
											if(item.last_message_sender) {
												item.last_message_sender = {
													_id : item.last_message_sender._id,
													name : item.last_message_sender.name,
													profile_picture : item.last_message_sender.profile_picture
												};
											}
											arr[index] = item;
										});
										aggregatedChats = populated;
										callback();
									}
									else {
										callback();
									}
								})
						});
					},
					function removeMyselfFromParticipants(callback) {
						aggregatedChats.forEach(function(chat, index, arr) {
							if(chat.participants && chat.participants.length) {
								if (chat.participants.length == 1) {
									// do nothing
								}
								else {
									chat.participants.forEach(function(participant, participantIndex, arr) {
										if(populatedUser._id.equals(participant.user)){
											arr.splice(participantIndex, 1);
										}
									})
								}

							}
							arr[index] = chat;
						});
						callback();
					},
					function setTitle(callback) {
						userModel.populate(aggregatedChats, {
							'path' : 'participants.user', 'select' : 'name profile_picture'
						}, function(err, populated) {
							if(err) return callback(err);
							if(!populated) {
								return callback();
							}
							populated.forEach(function(item, index, arr) {
								var createdTitle = '';
								if(item.participants && item.participants.length) {
									item.participants.forEach(function(participant, participantIndex, participantArr){
										try {
											if(participant.user != populatedUserId){
												item.seen_by_recipient = participant.seen;
											}
											if(participant.user) {
												createdTitle += participant.user.name.first;
												if(participantArr.length > participantIndex + 1) {
													createdTitle += ', ';
												}
											}
											else {
												// the participant may have been deleted otherwise...
											}
										}
										catch(err) {
											return callback(err);
										}
									})
									if(item.participants[0].user) {
										// item.picture = item.participants[0].user.profile_picture;
										item.profile_picture = item.participants[0].user.profile_picture;
										item.user = item.participants[0].user;
									}
								}
								item.title = createdTitle;
								arr[index] = item;
							});
							callback();
						})
					},
					function checkIfIsReply(callback) {
						var today = new Date();
						var isToday = false;
						aggregatedChats.forEach(function(item, index, arr) {
							if(moment().diff(item.last_message_sent_at, 'days') >= 1) {
								item.time = moment(new Date(item.last_message_sent_at)).format("MMM MM");
							}
							else {
								item.time = moment(new Date(item.last_message_sent_at)).format("h:mma");
							}
							if(item.last_message_sender &&
								populatedUser._id.equals(item.last_message_sender._id)) {
								item.is_reply = true;
							}
							else {
								item.is_reply = false;
							}
							arr[index] = item;
						});
						callback();
					}
				], function(err, res){
					if(err) return reject(err);
					return resolve(aggregatedChats);
				})
			})
		}
	};
	register(null, {
		chatPreviewGetter : chatPreviewGetter
	})
};
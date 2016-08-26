var async = require('async')
	;

module.exports = function setup(options, imports, register) {
	var userPopulator = imports.userPopulator,
		chatModel = imports.chatModel,
		logger = imports.logger.info,
		loggerType = 'chat-message-read-setter'
		;
	var chatMessageReadSetter = {
		set : function(messageId, userId) {
			var populatedUser,
				gotCount
				;
			return new Promise(function(resolve, reject) {
				var foundChat,
					savedChat
				;
				async.waterfall([
					function findChat(callback) {
						chatModel.findOne({"messages._id" : messageId}, function(err, response){
							if(err) return callback(err);
							foundChat = response;
							callback();
						});
					},
					function updateMeta(callback) {
						foundChat.messages.forEach(function(item, index, arr){
							if(item._id == messageId && item.meta && item.meta.length) {
								item.meta.forEach(function(metaItem, metaIndex, metaArr) {
									// console.log("Checking metaItem:", metaItem);
									if(metaItem.user == userId) {
										metaItem.read = true;
										metaArr[metaIndex] = metaItem;
									}
								})
							}
						});
						callback();
					},
					function saveChat(callback) {
						foundChat.save(function(err, saved){
							if(err) return callback(err);
							savedChat = saved;
							callback();
						})
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
var async = require('async')
;

module.exports = function setup(options, imports, register) {
	var userPopulator = imports.userPopulator,
		chatModel = imports.chatModel
	;
	var chatUnreadCounter = {
		count : function(user) {
			var populatedUser,
				gotCount
			;
			return new Promise(function(resolve, reject){
				async.waterfall([
					function populate(callback) {
						userPopulator.populate(user).then(function(response){
							populatedUser = response;
							callback();
						}).catch(callback);
					},
					// function populateMessages(callback) {
					// 	populatedUser.populate('chat', function(err, response){
					// 		if(err) return callback(err);
					// 		populatedUser = response;
					// 		callback();
					// 	})
					// },
					// function getUnreadCount(callback) {
					// 	populatedUser.chat.forEach(function(item, index, arr) {
					// 		if(item.)
					// 	})
					// }
					function find(callback) {
						chatModel.count({
							'participants.user' : populatedUser._id,
							'participants.read' : false
						}, function(err, count) {
							if(err) logger.error(err);
							gotCount = count;
							callback();
						});
					}
				], function(err, response){
					if(err) return reject(err);
					return resolve(gotCount);
				})
			})
		}
	};
	
	register(null, {
		chatUnreadCounter : chatUnreadCounter
	});
};
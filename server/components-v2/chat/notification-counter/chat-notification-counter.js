var async = require('async')
;

module.exports = function setup(options, imports, register) {
	var userPopulator = imports.userPopulator,
		chatModel = imports.chatModel,
		logger = imports.logger.info,
		loggerType = 'chat-notification-counter'
	;
	var chatNotificationCounter = {
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
					function find(callback) {
						chatModel.count({
							'participants' : {
								$elemMatch : {
									'user' : populatedUser._id,
									'notification' : true
								}
							}
						}, function(err, count) {
							if(err) logger.error(err);
							logger.info({ type : loggerType, msg : 'returned count for user: ' + populatedUser._id,
								count : count});
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
		chatNotificationCounter : chatNotificationCounter
	});
};
// create this
var async = require('async'),
	mongoose = require('mongoose')
	;
module.exports = function setup(options, imports, register) {
	var Model = imports.chatModel
		;
	var chatPopulator = {
		populate : function(chatOrId){
			return new Promise(function(resolve, reject){
				if(!chatOrId) {
					console.warn('Not sure why, but we asked for userPopulated and didn\'t pass in ' +
						'a user or id object at all');
					return resolve([]);
				}
				var _id = chatOrId._id ? chatOrId._id : mongoose.Types.ObjectId(chatOrId);

				Model.findById(_id).populate('participants.user').exec(function (err, item) {
					if (err) return reject(err);
					if(!item) {
						return reject(new Error('No Chat found using that objectOrID'));
					}
					return resolve(item);
				});
			});
		}
	};
	register(null, {
		chatPopulator : chatPopulator
	})
}
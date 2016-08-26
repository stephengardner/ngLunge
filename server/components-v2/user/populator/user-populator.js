// create this
var async = require('async'),
	mongoose = require('mongoose')
	;
module.exports = function setup(options, imports, register) {
	var userModel = imports.userModel
		;
	var userPopulator = {
		populate : function(userOrId){
			return new Promise(function(resolve, reject){
				if(!userOrId) {
					console.warn('Not sure why, but we asked for userPopulated and didn\'t pass in ' +
						'a user or id object at all');
					return resolve([]);
				}
				var _id = userOrId._id ? userOrId._id : mongoose.Types.ObjectId(userOrId);

				userModel.findById(_id).exec(function (err, user) {
					if (err) return reject(err);
					if(!user) {
						return reject(new Error('No User found using that objectOrID'));
					}
					return resolve(user);
				});
			});
		}
	};
	register(null, {
		userPopulator : userPopulator
	})
}
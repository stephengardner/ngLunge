// create this
var async = require('async'),
	mongoose = require('mongoose')
	;
module.exports = function setup(options, imports, register) {
	var reviewModel = imports.reviewModel
		;
	var reviewPopulator = {
		populate : function(objectOrId){
			return new Promise(function(resolve, reject){
				if(!objectOrId) {
					console.warn('Not sure why, but we asked for reviewPopulated and didn\'t pass in ' +
						'a user or id object at all');
					return resolve([]);
				}
				var _id = objectOrId._id ? objectOrId._id : mongoose.Types.ObjectId(objectOrId);

				reviewModel.findById(_id).exec(function (err, user) {
					if (err) return reject(err);
					if(!user) {
						return reject(new Error('No Review found using that objectOrID'));
					}
					return resolve(user);
				});
			});
		}
	};
	register(null, {
		reviewPopulator : reviewPopulator
	})
};
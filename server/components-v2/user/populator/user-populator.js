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
		},
		populateReviews : function(userOrId) {
			return new Promise(function (resolve, reject) {
				userPopulator.populate(userOrId).then(function (response) {
					response.populate('reviews.given', function (err, populated) {
						if (err) return reject(err);
						return resolve(populated);
					}).catch(reject);
				});
			})
		}
	};
	register(null, {
		userPopulator : userPopulator
	})
}
// create this
var async = require('async')
;
module.exports = function setup(options, imports, register) {
	var trainerModel = imports.trainerModel
	;
	var trainerPopulator = {
		populate : function(trainerOrId){
			return new Promise(function(resolve, reject){
				if(!trainerOrId) {
					console.warn('Not sure why, but we asked for trainerPopulated and didn\'t pass in ' +
						'a trainer or id object at all');
					return resolve([]);
				}
				var _id = trainerOrId._id ? trainerOrId._id : mongoose.Types.ObjectId(trainerOrId);

				trainerModel.findById(_id).exec(function (err, trainer) {
					if (err) return reject(err);
					if(!trainer) {
						return reject(new Error('No Trainer found using that objectOrID'));
					}
					return resolve(trainer);
				})
			});
		}
	};
	register(null, {
		trainerPopulator : trainerPopulator
	})
}
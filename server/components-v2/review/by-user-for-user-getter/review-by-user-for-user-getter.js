var async = require('async')
;
module.exports = function(options, imports, register) {
	var userPopulator = imports.userPopulator,
		reviewModel = imports.reviewModel,
		apiErrorHandler = imports.apiErrorHandler
		;
	var reviewByUserForUserGetter = {
		getAPI : function(req, res) {
			var from = req.params.id;
			var to = req.params.to;
			if(!to) {
				return apiErrorHandler.handleError(res, new Error('You must submit a "to" userID to check if there' +
					' is a' +
					' review'));
			}
			if(!from) {
				return apiErrorHandler.handleError(res, new Error('You must submit a "from" userID to check if there' +
					' is a' +
					' review'));
			}
			reviewByUserForUserGetter.get(from, to).then(function(response){
				return res.status(200).json(response);
			}).catch(function(err) {
				return apiErrorHandler.handleError(res, err);
			});
		},
		get : function(from, to) {
			var gotFrom, gotTo, foundReview
				;
			return new Promise(function(resolve, reject) {
				async.waterfall([
					function populateFrom(callback){
						userPopulator.populateReviews(from).then(function(response){
							gotFrom = response;
							return callback();
						}).catch(callback);
					},
					function populateTo(callback) {
						userPopulator.populate(to).then(function(response){
							gotTo = response;
							return callback();
						}).catch(callback);
					},
					function getUsingReviewModel(callback){
						reviewModel.findOne({
							from : gotFrom._id,
							to : gotTo._id,
							deleted : {$ne : true}
						}, function(err, found) {
							if(err) return callback(err);
							foundReview = found;
							return callback();
						});
					},
					function getAlternate(callback) {
						return callback(); // don't use this, but keep this method around, might be used in future
						for(var i = 0; i < gotFrom.reviews.given.length; i++){
							var review = gotFrom.reviews.given[i];
							if(review.to.equals(gotTo._id)) {
								foundReview = review;
								break;
							}
						}
						callback();
					}
				], function(err, response){
					if(err) return reject(err);
					if(foundReview) return resolve(foundReview);
					return resolve(false); // no review exists yet
				})
			})
		}
	};
	register(null, {
		reviewByUserForUserGetter : reviewByUserForUserGetter
	})
};
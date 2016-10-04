var async = require('async'),
	_ = require('lodash')
	;
// THIS WORKS
module.exports = function(options, imports, register) {
	var userPopulator = imports.userPopulator,
		reviewPopulator = imports.reviewPopulator,
		reviewModel = imports.reviewModel,
		apiErrorHandler = imports.apiErrorHandler,
		logger = imports.logger.info,
		loggerType = 'review-submitter'
		;
	var reviewDeleter = {
		deleteAPI : function(req, res) {
			var reviewId = req.params.id;
			if(!reviewId) {
				return apiErrorHandler.handleError(res, new Error('You must submit a reviewId to delete'));
			}
			reviewDeleter.delete(reviewId).then(function(response){
				return res.status(200).json(response);
			}).catch(function(err) {
				return apiErrorHandler.handleError(res, err);
			});
		},
		delete : function(reviewId) {
			return new Promise(function(resolve, reject) {
				var gotReview, 
					gotFrom, 
					gotTo,
					createdReview,
					foundReview,
					foundReviewIndex
					;
				if(!reviewId) {
					return apiErrorHandler.handleError(res, new Error('You must submit a reviewId to delete'));
				}
				async.waterfall([
					function populateReview(callback){
						reviewPopulator.populate(reviewId).then(function(response){
							gotReview = response;
							return callback();
						}).catch(callback);
					},
					function populateFrom(callback) {
						userPopulator.populate(gotReview.from).then(function(response){
							gotFrom = response;
							return callback();
						}).catch(callback);
					},
					function removeFromFromsListOfReviewedUsers(callback) {
						for(var i = 0; i < gotFrom.reviews.list_users_given.length; i++) {
							var userReviewedAtIndex = gotFrom.reviews.list_users_given[i];
							if(gotReview.to.equals(userReviewedAtIndex)) {
								gotFrom.reviews.list_users_given.splice(i, 1);
								break;
							}
						}
						callback();
					},
					function markReviewDeleted(callback) {
						gotReview.deleted = true;
						callback();
					},
					function saveReview(callback) {
						gotReview.save(function(err, saved) {
							if(err) return callback(err);
							return callback();
						})
					},
					function saveGotFrom(callback) {
						gotFrom.save(function(err, saved) {
							if(err) return callback(err);
							return callback();
						})
					}
				], function(err){
					if(err) return reject(err);
					return resolve(gotReview);
				})
			})
		}
	};
	register(null, {
		reviewDeleter : reviewDeleter
	})
};
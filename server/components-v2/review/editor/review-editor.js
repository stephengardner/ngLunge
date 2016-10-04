var async = require('async'),
	_ = require('lodash')
	;
module.exports = function(options, imports, register) {
	var userPopulator = imports.userPopulator,
		reviewModel = imports.reviewModel,
		apiErrorHandler = imports.apiErrorHandler
		;
	var reviewEditor = {
		submitAPI : function(req, res) {
			var from = req.params.id,
				to = req.body.userId,
				reviewId = req.body.reviewId
			;
			if(!from) {
				return apiErrorHandler.handleError(res, new Error('You must submit a userId as a "from" parameter'));
			}
			if(!to) {
				return apiErrorHandler.handleError(res, new Error('You must submit a userId as a "to" parameter'));
			}
			if(!reviewId) {
				return apiErrorHandler.handleError(res, 
					new Error('You must submit a review id as a "reviewId" parameter'));
			}
			reviewEditor.submit(from, to, reviewId).then(function(response){
				return res.status(200).json(response);
			}).catch(function(err) {
				return apiErrorHandler.handleError(res, err);
			});
		},
		submit : function(from, to, reviewId) {
			return new Promise(function(resolve, reject) {
				var gotFrom, gotTo,
					foundReview
					;
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
					function checkIfHasAlreadyReviewedThisPerson(callback) {
						for(var i = 0; i < gotFrom.reviews.given.length; i++){
							var review = gotFrom.reviews.given[i];
							if(review._id.equals(gotTo._id)) {
								foundReview = review;
								callback();
							}
						}
						callback(new Error);
					},
					function makeReview(callback) {
						createdReview = new reviewModel({
							created_at : new Date(),
							to : gotTo._id
						});
						createdReview = _.merge(createdReview, reviewObject);
						createdReview.save(function(err, saved) {
							if(err) return callback(err);
							return callback();
						});
					},
					function addToFromGivenReviews(callback) {
						gotFrom.reviews.given.push(createdReview._id);
						gotFrom.save(function(err, savedUser){
							if(err) return callback(err);
							return callback();
						})
					}
				], function(err, response){
					if(err) return reject(err);
					return resolve(gotFrom);
				})
			})
		}
	};
	register(null, {
		reviewEditor : reviewEditor
	})
};
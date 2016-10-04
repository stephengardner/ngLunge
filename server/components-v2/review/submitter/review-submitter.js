var async = require('async'),
	_ = require('lodash'),
	mongoose = require('mongoose')
	;
module.exports = function(options, imports, register) {
	var userPopulator = imports.userPopulator,
		reviewModel = imports.reviewModel,
		apiErrorHandler = imports.apiErrorHandler,
		logger = imports.logger.info,
		loggerType = 'review-submitter'
		;
	var reviewSubmitter = {
		submitAPI : function(req, res) {
			if(!req.body.userId) {
				return apiErrorHandler.handleError(res, new Error('You must submit a userId to review'));
			}
			reviewSubmitter.submit(req.params.id, req.body.userId, req.body.review).then(function(response){
				return res.status(200).json(response);
			}).catch(function(err) {
				return apiErrorHandler.handleError(res, err);
			});
		},
		submit : function(from, to, reviewObject) {
			return new Promise(function(resolve, reject) {
				var gotFrom, gotTo,
					createdReview,
					foundReview,
					foundReviewIndex,
					newStarAverage
					;
				if(from == to || (from.equals && from.equals(to))){
					logger.info({type : loggerType, msg: 'attempting to review yourself, this shouldn\'t be possible'});
					// return reject(new Error('You cannot review yourself'));
				}
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
						logger.info({type : loggerType, msg: 'checkIfHasAlreadyReviewedThisPerson'});
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
					function makeReview(callback) {
						logger.info({type : loggerType, msg: 'makeReview'});
						if(foundReview) return callback();
						createdReview = new reviewModel({
							created_at : new Date(),
							from : gotFrom._id,
							to : gotTo._id
						});
						createdReview = _.merge(createdReview, reviewObject);
						createdReview.save(function(err, saved) {
							if(err) return callback(err);
							return callback();
						});
					},
					function addToGivenReviewsIfNecessary(callback) {
						logger.info({type : loggerType, msg: 'addToGivenReviewsIfNecessary'});
						if(foundReview) return callback();
						gotFrom.reviews.given.push(createdReview._id);
						var foundInListUsersGiven = false;
						for(var i = 0; i < gotFrom.reviews.list_users_given.length; i++) {
							var user = gotFrom.reviews.list_users_given[i];
							if(user.equals(gotTo._id)) {
								foundInListUsersGiven = true;
								break;
							}
						}
						if(!foundInListUsersGiven) {
							gotFrom.reviews.list_users_given.push(gotTo._id);
						}
						callback();
					},
					function addToReceivedReviewsIfNecessary(callback) {
						logger.info({type : loggerType, msg: 'addToReceivedReviewsIfNecessary'});
						if(foundReview) return callback();
						gotTo.reviews.received.push(createdReview._id);
						callback();
					},
					function saveFromIfNecessary(callback) {
						if(foundReview) return callback();
						gotFrom.save(function(err, savedUser){
							if(err) return callback(err);
							return callback();
						})
					},
					function editReviewIfNecessary(callback) {
						if(!foundReview) return callback();
						reviewModel.findById(foundReview._id, function(err, review){
							if(err) return callback();
							var pastEdit = {
								rating_overall : review.rating_overall,
								text_overall : review.text_overall,
								recommended : review.recommended,
								created_at : review.edited_at || review.created_at // this works
							};
							review.past_edits.push(pastEdit);
							review.rating_overall = reviewObject.rating_overall;
							review.text_overall = reviewObject.text_overall;
							review.recommended = reviewObject.recommended;
							review.edited_at = new Date();
							review.save(function(err, saved){
								if(err) return callback(err);
								callback();
							});
 
						});
					},
					function getNewAverageForTo(callback) {
						reviewModel.aggregate([
							{
								$match: {
									'to' : mongoose.Types.ObjectId(gotTo._id),
									'deleted' : {$ne : true}
								}
							},
							{
								$group: {
									_id : '$to',
									average: {
										$avg: '$rating_overall'
									},
									count : {
										$sum : 1
									}
								}
							}
						], function (err, result) {
							if(err) return reject(err);
							console.log("Result:", result);
							newStarAverage = result[0].average;
							newStarAverageCount = result[0].count;
							var newAverageRating = Math.round(newStarAverage * 100) / 100;
							console.log("new Average Rating:", newAverageRating);
							gotTo.rating_average_stars = newAverageRating;
							gotTo.rating_average_count = newStarAverageCount;
							return callback();
						});
					},
					function saveToAlways(callback) {
						// if(foundReview) return callback();
						gotTo.save(function(err, savedUser){
							if(err) return callback(err);
							return callback();
						})
					},
				], function(err, response){
					if(err) return reject(err);
					return resolve(gotFrom);
				})
			})
		}
	};
	register(null, {
		reviewSubmitter : reviewSubmitter
	})
};
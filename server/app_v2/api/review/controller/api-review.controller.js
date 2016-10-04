'use strict';

var config = require('../../../../config/environment'),
	async = require('async'),
	_ = require('lodash')
	;

module.exports = function setup(options, imports, register) {
	var reviewModel = imports.reviewModel,
		logger = imports.logger.info,
		apiErrorHandler = imports.apiErrorHandler,
		reviewDeleter = imports.reviewDeleter
		;
	var exports = {};

	/**
	 * Get list of users
	 * restriction: 'admin'
	 */
	exports.index = function(req, res) {
		reviewModel.find({}, function (err, users) {
			if(err) return res.send(500, err);
			res.json(200, users);
		});
	};
	exports.delete = reviewDeleter.deleteAPI;

	register(null, {
		apiReviewController : exports
	});
};
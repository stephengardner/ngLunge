'use strict';

/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /activities              ->  index
 * POST    /activities              ->  create
 * GET     /activities/:id          ->  show
 * PUT     /activities/:id          ->  update
 * DELETE  /activities/:id          ->  destroy
 */

var _ = require('lodash');

var validationError = function(res, err) {
	return res.json(422, err);
};

module.exports = function setup(options, imports, register) {
	var Specialty = imports.specialtyModel,
		userModel = imports.userModel
		;
	var exports = {};

	// Get list of things
	exports.index = function(req, res) {
		Specialty.find({}).exec(function(err, certs){
			if(err) { return handleError(res, err); }
			return res.status(200).json(certs);
		});
	};

	// Get a single thing
	exports.show = function(req, res) {
		Specialty.find({ id : req.params.id}, function (err, cert) {
			if(err) { return handleError(res, err); }
			if(!cert[0]) { return res.sendStatus(404); }
			return res.status(200).json(cert[0]);
		});
	};

	exports.query = function(req, res) {
		var query = {
			name : new RegExp(req.params.query, "i")
		};
		if (req.query.userId) {
			userModel.findById(req.query.userId, function(err, found) {
				if(err) return handleError(res, err);
				if(!found) return res.send(404);
				query['_id'] = {"$nin": found.specialties};
				performSearch();
			});
		}
		else {
			performSearch();
		}
		function performSearch() {
			Specialty.find(query).limit(10).exec(function (err, specialties) {
				if(err) { return handleError(res, err); }
				console.log("Query reslt:", specialties);
				if(!specialties[0]) { return res.sendStatus(404); }
				return res.status(200).json(specialties);
			});
		}
	}

	register(null, {
		apiSpecialtyController : exports
	});
}
function handleError(res, err) {
	return res.sendStatus(500, err);
}
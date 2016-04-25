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
	var Specialty = imports.specialtyModel;
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
		Specialty.find({ name : new RegExp(req.params.query, "i")}).limit(8).exec(function (err, specialties) {
			if(err) { return handleError(res, err); }
			console.log("Query reslt:", specialties);
			if(!specialties[0]) { return res.sendStatus(404); }
			return res.status(200).json(specialties);
		});
	}

	register(null, {
		apiSpecialtyController : exports
	});
}
function handleError(res, err) {
	return res.sendStatus(500, err);
}
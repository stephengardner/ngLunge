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

module.exports = function(app) {
	var Specialty = app.models.Specialty;

	// Get list of things
	exports.index = function(req, res) {
		Specialty.find({}).exec(function(err, certs){
			if(err) { return handleError(res, err); }
			return res.json(200, certs);
		});
	};

	// Get a single thing
	exports.show = function(req, res) {
		Specialty.find({ id : req.params.id}, function (err, cert) {
			if(err) { return handleError(res, err); }
			if(!cert[0]) { return res.send(404); }
			return res.json(cert[0]);
		});
	};

	exports.query = function(req, res) {
		Specialty.find({ name : new RegExp(req.params.query, "i")}).limit(8).exec(function (err, specialties) {
			if(err) { return handleError(res, err); }
			console.log("Query reslt:", specialties);
			if(!specialties[0]) { return res.send(404); }
			return res.json(specialties);
		});
	}

	return exports;
}
function handleError(res, err) {
	return res.send(500, err);
}
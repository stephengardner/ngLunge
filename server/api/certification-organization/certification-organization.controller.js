/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /trainers              ->  index
 * POST    /trainers              ->  create
 * GET     /trainers/:id          ->  show
 * PUT     /trainers/:id          ->  update
 * DELETE  /trainers/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');

var validationError = function(res, err) {
	return res.json(422, err);
};

module.exports = function(app) {
	var CertificationOrganizations = app.models.CertificationOrganizations;
	var exports = {};

	// Get list of things
	exports.index = function(req, res) {
		CertificationOrganizations.find({}).populate('certification').exec(function(err, cert_types){
			if(err) { return handleError(res, err); }
			return res.json(200, cert_types);
		});
	};

	// Get a single thing
	exports.show = function(req, res) {
		CertificationOrganizations.findById(req.params.id, function (err, cert) {
			if(err) { return handleError(res, err); }
			if(!cert) { return res.status(404).send(404); }
			return res.json(cert);
		});
	};

	// Creates a new thing in the DB.
	exports.create = function(req, res) {
		var newCertOrganization = new CertificationOrganizations(req.body);
		newCertOrganization.save(function(err, savedCertOrganization){
			if (err) return validationError(res, err);
			res.json({ cert : savedCertOrganization });
		});

	};

	return exports;
}

function handleError(res, err) {
	return res.send(500, err);
}
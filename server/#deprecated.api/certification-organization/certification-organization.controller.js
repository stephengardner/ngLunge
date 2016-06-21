/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /trainers              ->  index
 * POST    /trainers              ->  create
 * GET     /trainers/:id          ->  show
 * PUT     /trainers/:id          ->  update
 * DELETE  /trainers/:id          ->  destroy
 */

'use strict';
var logger = require("../../components/logger")();
var _ = require('lodash');
var errorHelper = require("../../components/error-helper");

var validationError = errorHelper.filterDefaultErrors;

module.exports = function(app) {
	var CertificationOrganizations = app.models.CertificationOrganization;
	var exports = {};

	// Get list of things
	exports.index = function(req, res) {
		CertificationOrganizations.find({}).populate('certifications').exec(function(err, cert_types){
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

	exports.search = function(req, res) {
		CertificationOrganizations.find({'name' : new RegExp(req.params.query, "i")}).limit(10)
			.populate('certifications')
			.exec(function(err, organizations){
				if(err) { return handleError(res, err); }
				if(!organizations) { return res.status(404).send(404); }
				return res.json(organizations);
		})
	};

	// Get a single thing
	exports.showBySlug = function(req, res) {
		CertificationOrganizations.findOne({'slug' : req.query.slug}, function (err, cert) {
			if(err) { return handleError(res, err); }
			if(!cert) { return res.status(404).send(404); }
			return res.status(200).json(cert);
		});
	};

	// Creates a new thing in the DB.
	exports.create = function(req, res) {
		var newCertOrganization = new CertificationOrganizations(req.body);
		newCertOrganization.save(function(err, savedCertOrganization){
			if (err) return validationError(res, err);
			res.json(savedCertOrganization);
		});

	};
	exports.destroy = function(req, res) {
		CertificationOrganizations.findById(req.params.id, function (err, cert) {
			if(err) { return handleError(res, err); }
			if(!cert) { return res.send(404); }
			cert.remove(function(err) {
				if(err) { return handleError(res, err); }
				return res.send(204);
			});
		});
	};

	return exports;
}

function handleError(res, err) {
	return res.send(500, err);
}
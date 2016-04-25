'use strict';
var _ = require('lodash');
var errorHelper = require("../../../../components/error-helper");

var validationError = errorHelper.filterDefaultErrors;

module.exports = function setup(options, imports, register) {
	var logger = imports.logger.info;

	var CertificationOrganizations = imports.certificationOrganizationModel;
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

	exports.showPage = function(req, res) {

		var DEFAULTS = {
			nextMaxId : Infinity,
			itemsPerPage : 10
		};
		var nextMaxId = parseInt(req.query.nextMaxId) !== 0 ? (parseInt(req.query.nextMaxId) ? parseInt(req.query.nextMaxId) : DEFAULTS.nextMaxId) : 0;
		var itemsPerPage = parseInt(req.query.itemsPerPage) || DEFAULTS.itemsPerPage;
		if(itemsPerPage > 20)
			itemsPerPage = 20;
		var searchQuery = {};
		searchQuery.id = { $lte : nextMaxId };


		// TODO * this is not efficient, querying a mongodb field on a regular expression that is either case insensitive
		// TODO * or not using the rooted expression '^' can be slow when searching larger documents
		if(req.query.query && req.query.query.length) {
			searchQuery['$or'] = [
				{
					'name' : { $regex : new RegExp(req.query.query, "i") }
				}
			];
		}
		var populateQuery = [{path:'certifications'}];
		CertificationOrganizations.find(searchQuery)
			.populate(populateQuery)
			.limit(itemsPerPage)
			.sort('-id').exec(function(err, certifications){
			if(err) { return handleError(res, err); }
			if(!certifications.length) { return res.send(404); }
			res.setHeader('X-Next-Max-Id', certifications[certifications.length-1].id -1);
			return res.json(200, certifications);
		})
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

	register(null, {
		apiCertificationOrganizaitonController: exports
	});
}

function handleError(res, err) {
	return res.send(500, err);
}
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

module.exports = function setup(options, imports, register) {
	var CertificationType = imports.certificationTypeModel;

	var certificationDocumentProcess = imports.certificationDocumentProcess;
	//var certificationDocumentUpload = imports.certificationDocumentUpload;
	var exports = {};

	// User upload a certification document for this cert type
	exports.upload = certificationDocumentProcess.process;

	// Get list of things
	exports.index = function(req, res) {
		CertificationType.find({}).populate('certification').exec(function(err, cert_types){
			if(err) { return handleError(res, err); }
			return res.json(200, cert_types);
		});
	};

	// Get a single thing
	exports.show = function(req, res) {
		CertificationType.findById(req.params.id, function (err, cert) {
			if(err) { return handleError(res, err); }
			if(!cert) { return res.status(404).send(404); }
			return res.json(cert);
		});
	};

	// Creates a new thing in the DB.
	exports.create = function(req, res) {
		var newCertType = new CertificationType(req.body);
		newCertType.save(function(err, savedCertType){
			if (err) return validationError(res, err);
			else res.status(200).json(savedCertType);
		});

	};

	exports.destroy = function(req, res) {
		CertificationType.findById(req.params.id, function (err, cert) {
			if(err) { return handleError(res, err); }
			if(!cert) { return res.send(404); }
			cert.remove(function(err) {
				if(err) { return handleError(res, err); }
				return res.send(204);
			});
		});
	};
	register(null, {
		apiCertificationTypeController : exports
	});
}

function handleError(res, err) {
	return res.send(500, err);
}
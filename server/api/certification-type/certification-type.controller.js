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
var CertificationType = require('./certification-type.model');

var validationError = function(res, err) {
	return res.json(422, err);
};

// Get list of things
exports.index = function(req, res) {
	CertificationType.find({}).populate('certification').exec(function(err, cert_types){
		if(err) { return handleError(res, err); }
		return res.json(200, cert_types);
	});
};
// Get a single thing
exports.show = function(req, res) {
	CertificationType.find({ id : req.params.id}, function (err, cert) {
		if(err) { return handleError(res, err); }
		if(!cert[0]) { return res.send(404); }
		return res.json(cert[0]);
	});
};
// Creates a new thing in the DB.
exports.create = function(req, res) {

	//Certification.findOne({name : req.body.cert.name})
	var newCertType = new CertificationType(req.body);
	newCertType.save(function(err, cert_type){
		if (err) return validationError(res, err);
		res.json({ cert : cert });
	});

};

function handleError(res, err) {
	return res.send(500, err);
}
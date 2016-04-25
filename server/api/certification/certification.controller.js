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

Array.prototype.diff = function(a) {
	return this.filter(function(i) {return a.indexOf(i) < 0;});
};

module.exports = function(app) {
	var Certification = app.models.Certification;
	var CertificationType = app.models.CertificationType;
	var exports = {};

// Get list of things
	exports.index = function(req, res) {
		Certification.find({}).populate('types', 'name').exec(function(err, certs){
			if(err) { return handleError(res, err); }
			return res.json(200, certs);
		});
	};

	// Get a single thing
	exports.show = function(req, res) {
		Certification.findById(req.params.id, function (err, cert) {
			if(err) { return handleError(res, err); }
			if(!cert) { return res.status(404).send(404); }
			return res.json(cert);
		});
	};

	// Updates an existing thing in the DB.
	exports.addType = function(req, res) {
		if(req.body._id) { delete req.body._id; }
		Certification.findById(req.params.id).populate('types', 'name').exec(function (err, cert) {
			if (err) { return handleError(res, err); }
			if(!cert) { return res.send(404); }
			var newCerts = req.body.types;
			for(var i = 0; i < newCerts.length; i++){
				var newCert = new CertificationType(newCerts[i]);//newCerts[i];
				newCert.certification = cert._id;
				console.log("Certification update, attempting to save a new certificationtype:", newCert);
				newCert.save(function(err, cert_type){
					if (err) { return handleError(res, err); }
					if(!cert_type) { return res.send(404); }
					cert.types.push(cert_type._id);
					cert.save(function(err, cert){
						if (err) { return handleError(res, err); }
						if(!cert) { return res.send(404); }
						Certification.populate(cert, {path : 'types'}, function(err, cert){
							console.log("POPULATED:",cert);
							if (err) { return handleError(res, err); }
							if(!cert) { return res.send(404); }
							return res.json(200,cert);
						});
					});
				});
			}
		});
	};

	exports.destroy = function(req, res) {
		Certification.findById(req.params.id, function (err, cert) {
			if(err) { return handleError(res, err); }
			if(!cert) { return res.send(404); }
			cert.remove(function(err) {
				if(err) { return handleError(res, err); }
				return res.send(204);
			});
		});
	};

	// Creates a new thing in the DB.
	exports.create = function(req, res) {
		Certification.create(req.body, function(err, cert) {
			if(err) { return handleError(res, err); }
			return res.json(201, cert);
		});
	};

	exports.removeType = function(req, res) {
		if(req.body._id) { delete req.body._id; }
		Certification.findById(req.params.id).populate('types', 'name').exec(function (err, cert) {
			console.log("deleting from cert:", cert.name);
			if (err) { return handleError(res, err); }
			if(!cert) { return res.send(404); }
			var typesToRemove = req.body.types;
			for(var i = 0; i < typesToRemove.length; i++){
				var typeToRemove = typesToRemove[i];
				CertificationType.findById(typeToRemove._id).exec(function(err, cert_type) {
					console.log("Updating cert:", cert.name, " to remove: ", cert_type.name);
					cert.types.remove(cert_type._id, function(err, cert) {
						if (err) { return handleError(res, err); }
						if(!cert) { return res.send(404); }
						console.log("1DONE...", cert, "or err:", err);
					});
					cert.save(function(err, cert) {
						if (err) { return handleError(res, err); }
						if(!cert) { return res.send(404); }
						console.log("2DONE...", cert, "or err:", err);
						res.json(201, cert);
					});
				});
			}
		});
	}

	// Creates a new thing in the DB.
	exports.update = function(req, res) {
		var newCert = new Certification(req.body);
		newCert.save(function(err, cert){
			if (err) return validationError(res, err);
			res.json({ cert : cert });
		});
	};

	// Creates a new thing in the DB.
	exports.create = function(req, res) {
		var newCert = new Certification(req.body);
		newCert.save(function(err, cert){
			if (err) return validationError(res, err);
			res.json({ cert : cert });
		});
	};

	return exports;
}
function handleError(res, err) {
	return res.send(500, err);
}
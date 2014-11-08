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
var Trainer = require('./trainer.model');

// Get list of things
exports.index = function(req, res) {
	Trainer.find(function (err, trainers) {
		if(err) { return handleError(res, err); }
		return res.json(200, trainers);
	});
};

// Get a single thing
exports.show = function(req, res) {
	Trainer.find({ id : req.params.id}, function (err, trainer) {
		if(err) { return handleError(res, err); }
		if(!trainer[0]) { return res.send(404); }
		return res.json(trainer[0]);
	});
	/*
	Trainer.findById(req.params.id, function (err, trainer) {
		if(err) { return handleError(res, err); }
		if(!trainer) { return res.send(404); }
		return res.json(trainer);
	});
	*/
};
exports.showType = function(req, res) {
	if(req.params.type == "all"){
		var json_result = {};
		Trainer.find({type : "in-home"}, function (err, trainer) {
			if(err) { return handleError(res, err); }
			if(!trainer) { return res.send(404); }
			json_result['in-home'] =  trainer;//res.json(trainer);
			Trainer.find({type : "in-gym"}, function (err, trainer) {
				if(err) { return handleError(res, err); }
				if(!trainer) { return res.send(404); }
				json_result['in-gym'] = trainer;//res.json(trainer);
				return res.json(200, json_result);
			});
		});
		//return JSON.stringify(100);//res.json(json_result);
		var fuck = {"fuck" : "no"};
	}
	else {
		Trainer.find({type : req.params.type}, function (err, trainer) {
			if(err) { return handleError(res, err); }
			if(!trainer) { return res.send(404); }
			return res.json(trainer);
		});
	}
};

// Creates a new thing in the DB.
exports.create = function(req, res) {
	Trainer.create(req.body, function(err, trainer) {
		if(err) { return handleError(res, err); }
		return res.json(201, trainer);
	});
};

// Updates an existing thing in the DB.
exports.update = function(req, res) {
	if(req.body._id) { delete req.body._id; }
	Trainer.findById(req.params.id, function (err, trainer) {
		if (err) { return handleError(res, err); }
		if(!trainer) { return res.send(404); }
		var updated = _.merge(trainer, req.body);
		updated.save(function (err) {
			if (err) { return handleError(res, err); }
			return res.json(200, trainer);
		});
	});
};

// Deletes a thing from the DB.
exports.destroy = function(req, res) {
	Trainer.findById(req.params.id, function (err, trainer) {
		if(err) { return handleError(res, err); }
		if(!trainer) { return res.send(404); }
		trainer.remove(function(err) {
			if(err) { return handleError(res, err); }
			return res.send(204);
		});
	});
};

function handleError(res, err) {
	return res.send(500, err);
}
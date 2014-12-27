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
var Lunger = require('./lunger.model');
var Registration = require('../registration/registration.model');
var nodemailer = require('nodemailer');

var validationError = function(res, err) {
	return res.json(422, err);
};

// Get list of things
exports.index = function(req, res) {
	Lunger.find({}, '-salt -hashedPassword', function (err, lungers) {
		if(err) { return handleError(res, err); }
		return res.json(200, lungers);
	});
};
// Get a single thing
exports.show = function(req, res) {
	Lunger.find({ id : req.params.id}, '-salt -hashedPassword', function (err, lunger) {
		if(err) { return handleError(res, err); }
		if(!lunger[0]) { return res.send(404); }
		return res.json(lunger[0]);
	});
	/*
	Trainer.findById(req.params.id, function (err, trainer) {
		if(err) { return handleError(res, err); }
		if(!trainer) { return res.send(404); }
		return res.json(trainer);
	});
	*/
};
// Creates a new thing in the DB.
exports.create = function(req, res) {
	var newTrainer = new Trainer(req.body);
	newTrainer.provider = 'local';
	newTrainer.role = 'trainer';
	newTrainer.verified = false;
	newTrainer.save(function(err, trainer){
		if (err) return validationError(res, err);
		var token = jwt.sign({_id: trainer._id }, config.secrets.session, { expiresInMinutes: 60*5 });
		res.json({ trainer : trainer, token: token });
	});
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
	var userId = req.user._id;
	console.log("lunger userID:", req.user._id);
	console.log("lunger other userID:",req.trainer.id);
	if(req.body.type)
	Trainer.findOne({
		_id: userId
	}, '-salt -hashedPassword', function(err, trainer) { // don't ever give out the password or salt
		if (err) return next(err);
		if (!trainer) return res.json(401);
		res.json(trainer);
	});
};
function handleError(res, err) {
	return res.send(500, err);
}
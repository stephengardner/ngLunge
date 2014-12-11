'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');
var app = require('../../app');

var router = express.Router();

router.post('/', function(req, res, next) {
	console.log("the request body is: ", req.body);
	passport.authenticate('local', function (err, userOrTrainer, info) {
		console.log("-*- authenticated and the trainer output is:", userOrTrainer);
		var error = err || info;
		if (error) return res.json(401, error);
		if (!userOrTrainer) return res.json(404, {message: 'Something went wrong, please try again.'});

		app.e.emit("login", userOrTrainer);

		var token = auth.signToken(userOrTrainer._id, req.body.type);
		res.json({token: token, type : req.body.type});
	})(req, res, next)
});

module.exports = router;
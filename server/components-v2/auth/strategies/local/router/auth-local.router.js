'use strict';

var express = require('express');
var passport = require('passport');

module.exports = function setup(options, imports, register) {
	var auth = imports.auth;
	var bruteforce = imports.bruteforce;
	var router = express.Router();

	router.post('/', /*bruteforce.prevent,*/ function(req, res, next) {
		console.log("the request body is: ", req.body);
		passport.authenticate('local', function (err, userOrTrainer, info) {
			console.log("passport local authentication callback");
			//console.log("-*- authenticated and the trainer output is:", userOrTrainer);
			var error = err || info;
			if (error) return res.json(401, error);
			if (!userOrTrainer) return res.json(404, {message: 'Something went wrong, please try again.'});
			var token = auth.signToken(userOrTrainer._id, req.body.type);
			console.log("--------=================------------");
			req.trainer = userOrTrainer;
			console.log("Signing token for user: ", req.user, " as token : ", token);
			console.log("--------=================------------");

			res.cookie('token', JSON.stringify(token));
			var type = req.body.type ? req.body.type : "user";
			res.cookie('type', JSON.stringify(type));
			res.json({token: token, type : req.body.type});
		})(req, res, next)
	});

	register(null, {
		authLocalRouter : router
	});
}
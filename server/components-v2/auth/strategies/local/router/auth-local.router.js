'use strict';

var express = require('express');
var passport = require('passport');

module.exports = function setup(options, imports, register) {
	var auth = imports.auth;
	var bruteforce = imports.bruteforce;
	var router = express.Router();

	var setErrorField = function(errObj, field, message) {
		errObj.errors[field] = {
			message : message,
			name : 'CustomValidationError',
			path : field,
			type : 'custom'
		};
	}
	var customValidationError = function(res, errField, errMessage) {
		var err = {
			message : 'Custom Validation Failed',
			name : 'CustomValidationError',
			errors : {
			}
		};
		if(typeof errField == 'object') {
			for(var i in errField) {
				if(errField.hasOwnProperty(i))
					setErrorField(err, errField[i], errField[i].message);
			}
		}
		else {
			setErrorField(err, errField, errMessage);
		}
		return authenticationError(res, err);
	};

	var authenticationError = function(res, err) {
		return res.json(401, err);
	};
	router.post('/', /*bruteforce.prevent,*/ function(req, res, next) {
		console.log("the request body is: ", req.body);
		if(req.body.type == 'trainer') {
			passport.authenticate('local-trainer', function (err, userOrTrainer, info) {
				console.log("passport local authentication callback");
				//console.log("-*- authenticated and the trainer output is:", userOrTrainer);
				var error = err || info;
				if (error) return customValidationError(res, error.field, error.message);
				// if (!userOrTrainer) return res.json(404, {message: 'Something went wrong, please try again.'});
				var token = auth.signToken(userOrTrainer._id, req.body.type);
				var type = req.body.type ? req.body.type : "user";
				req.trainer = userOrTrainer;
				// console.log("Setting token for user: ", userOrTrainer, " on cookies... token is: " + token);
				res.cookie('token', JSON.stringify(token));
				res.cookie('type', JSON.stringify(type));
				res.json({token: token, type : req.body.type, trainer : userOrTrainer});
			})(req, res, next)
		}
		else if(req.body.type == 'user') {
			passport.authenticate('local-user', function (err, userOrTrainer, info) {
				console.log("passport local authentication callback");
				//console.log("-*- authenticated and the trainer output is:", userOrTrainer);
				var error = err || info;
				if (error) return customValidationError(res, error.field, error.message);//res.json(401, error);
				// if (!userOrTrainer) return res.json(404, {message: 'Something went wrong, please try again.'});
				var token = auth.signToken(userOrTrainer._id, req.body.type);
				var type = req.body.type ? req.body.type : "user";
				req.trainer = userOrTrainer;
				res.cookie('token', JSON.stringify(token));
				res.cookie('type', JSON.stringify(type));
				res.json({token: token, type : req.body.type});
			})(req, res, next)
		}
		else {
			res.status(500).send('no thanks');
		}
	});

	register(null, {
		authLocalRouter : router
	});
}
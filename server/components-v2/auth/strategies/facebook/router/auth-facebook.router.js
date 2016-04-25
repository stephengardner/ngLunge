'use strict';

var express = require('express'),
	passport = require('passport'),
	config = require('../../../../../config/environment')
	;

module.exports = function setup(options, imports, register) {
	var auth = imports.auth,
		bruteforce = imports.bruteforce,
		router = express.Router(),
		trainerModel = imports.trainerModel
		;

	router
		.get('/trainer-sync', auth.isTrainerMe(), passport.authenticate('facebookTrainerSync', {
			scope: ['email', 'user_about_me'],
			session: false,
			callbackURL: config.facebook.callbackTrainerURL
		}));

	router
		.get('/callback-trainer-sync', passport.authenticate('facebookTrainerSync', {
			scope: ['email', 'user_about_me'],
			failureRedirect: '/no2',
			session: false,
			callbackURL: config.facebook.callbackTrainerURL
		}), function(req, res, next) {
			// This wont happen
			//if(req.trainer) {
			//	console.log("REQ TRAINER");
			//}
			console.log("\n\nCallback req.user.facebook is:", req.user.facebook);
			if(req.session.trainer) {
				console.log("Req session trainer is here", req.session.trainer.name);
				var trainer = req.session.trainer;
				trainerModel.findById(trainer._id, function(err, trainer){
					console.log("Setting trainer.facebook to be : ", req.user._json);
					trainer.facebook = req.user._json;
					trainer.save(function(err, user) {
						return res.redirect("/trainer/info");
					});
				});
			}
			else {
				console.log("Lunge Error: auth.facebook.index.js NO req.session.trainer");
				return res.redirect("/"/* + req.session.trainer.urlName*/);
			}
		});

	register(null, {
		authFacebookRouter : router
	});
}
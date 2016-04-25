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
		.get('/trainer-sync', auth.isTrainerMe(), passport.authenticate('linkedinTrainerSync', {
			scope: ['r_basicprofile', 'r_emailaddress'],
			session: false,
			callbackURL: config.linkedin.callbackTrainerURL
		}));

	router
		.get('/callback-trainer-sync', passport.authenticate('linkedinTrainerSync', {
			scope: ['r_basicprofile', 'r_emailaddress'],
			failureRedirect: '/no2',
			session: false,
			callbackURL: config.linkedin.callbackTrainerURL
		}), function(req, res, next) {
			if(req.session.trainer) {
				var trainer = req.session.trainer,
					linkedin = req.user._json;
				trainerModel.findById(trainer._id, function(err, trainer){
					trainer.linkedin = linkedin;
					trainer.linkedin.link = linkedin.publicProfileUrl;
					trainer.save(function(err, saved) {
						return res.redirect("/trainer/info");
					});
				});
			}
		});

	register(null, {
		authLinkedinRouter : router
	});
}
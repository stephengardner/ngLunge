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
		.get('/trainer-sync', auth.isTrainerMe(), passport.authenticate('instagramTrainerSync', {
			session: false,
			callbackURL: config.instagram.callbackTrainerURL
		}));

	router
		.get('/callback-trainer-sync', passport.authenticate('instagramTrainerSync', {
			failureRedirect: '/no2',
			session: false,
			callbackURL: config.instagram.callbackTrainerURL
		}), function(req, res, next) {
			if(req.session.trainer) {
				var trainer = req.session.trainer,
					instagram = req.user._json.data;
				trainerModel.findById(trainer._id, function(err, trainer){
					trainer.instagram = instagram;
					trainer.instagram.link = 'http://instagram.com/' + instagram.username;
					trainer.save(function(err, saved) {
						return res.redirect("/trainer/info");
					});
				});
			}
		});

	register(null, {
		authInstagramRouter : router
	});
}
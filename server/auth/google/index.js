'use strict';

var express = require('express');
var passport = require('passport');
var config = require("../../config/environment");

module.exports = function(app) {
	var Trainer = app.models.Trainer;
	var auth = require('../auth.service')(app);
	var router = express.Router();
	router
		.get('/', passport.authenticate('google', {
			failureRedirect: '/signup',
			scope: [
				'https://www.googleapis.com/auth/userinfo.profile',
				'https://www.googleapis.com/auth/userinfo.email'
			],
			session: false
		}))

		.get('/callback', passport.authenticate('google', {
			failureRedirect: '/signup',
			session: false
		}), auth.setTokenCookie);

// trainer link profile facebook auth
	router
		.get('/trainer-sync', auth.isTrainerMe(), passport.authenticate('google', {
			scope: [
				'https://www.googleapis.com/auth/userinfo.profile',
				'https://www.googleapis.com/auth/userinfo.email'
			],
			failureRedirect: '/signup',
			session: false,
			callbackURL: config.google.callbackTrainerURL
		}))
	router
		.get('/callback-trainer-sync', passport.authenticate('google', {
			failureRedirect: '/signup',
			session: false,
			callbackURL: config.google.callbackTrainerURL
		}), function(req, res, next) {
			if(req.session.trainer) {
				var trainer = req.session.trainer;
				Trainer.findById(req.session.trainer._id, function(err, trainer){
					var trainer = trainer;
					//req.user.twitter = JSON.parse(req.user.twitter);
					//req.user.google.link = "http://twitter.com/" + req.user.google.screen_name;
					trainer.google = req.user.google;
					trainer.save(function(err, user) {
						return res.redirect("/" + req.session.trainer.urlName);
						//return res.json(req.session.trainer);
					});
				});
			}
		});
	return router;
}
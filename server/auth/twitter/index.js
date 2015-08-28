'use strict';

var express = require('express');
var passport = require('passport');
var config = require("../../config/environment");

var router = express.Router();

module.exports = function(app) {
	var auth = require('../auth.service')(app);
	var Trainer = app.models.Trainer;
	router
		.get('/', passport.authenticate('twitter', {
			failureRedirect: '/signup',
			session: false
		}))

		.get('/callback', passport.authenticate('twitter', {
			failureRedirect: '/signup',
			session: false
		}), auth.setTokenCookie);

// trainer link profile facebook auth
	router
		.get('/trainer-sync', auth.isTrainerMe(), passport.authenticate('twitter', {
			scope: ['email', 'user_about_me'],
			failureRedirect: '/signup',
			session: false,
			callbackURL: config.twitter.callbackTrainerURL
		}))
	router
		.get('/callback-trainer-sync', passport.authenticate('twitter', {
			failureRedirect: '/signup',
			session: false,
			callbackURL: config.twitter.callbackTrainerURL
		}), function(req, res, next) {
			if(req.session.trainer) {
				var trainer = req.session.trainer;
				Trainer.findById(req.session.trainer._id, function(err, trainer){
					var trainer = trainer;
					//req.user.twitter = JSON.parse(req.user.twitter);
					req.user.twitter.link = "http://twitter.com/" + req.user.twitter.screen_name;
					trainer.twitter = req.user.twitter;
					trainer.save(function(err, user) {
						return res.redirect("/" + req.session.trainer.urlName);
						//return res.json(req.session.trainer);
					});
				});
			}
		});
	return router;
}
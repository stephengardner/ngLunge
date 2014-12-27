'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');
var config = require("../../config/environment");
var Trainer = require("../../api/trainer/trainer.model");

var router = express.Router();

// normal user facebook auth
router
	.get('/', passport.authenticate('facebook', {
		scope: ['email', 'user_about_me'],
		failureRedirect: '/signup',
		session: false
	}))
router
	.get('/callback', passport.authenticate('facebook', {
		failureRedirect: '/signup',
		session: false
	}), auth.setTokenCookie);

// trainer link profile facebook auth
router
	.get('/trainer-sync', auth.isTrainerMe(), passport.authenticate('facebook', {
		scope: ['email', 'user_about_me'],
		failureRedirect: '/signup',
		session: false,
		callbackURL: config.facebook.callbackTrainerURL
	}))
router
	.get('/callback-trainer-sync', passport.authenticate('facebook', {
		failureRedirect: '/signup',
		session: false
	}), function(req, res, next) {
		if(req.session.trainer) {
			var trainer = req.session.trainer;
			Trainer.findById(req.session.trainer._id, function(err, trainer){
				var trainer = trainer;
				trainer.facebook = req.user.facebook;
				trainer.save(function(err, user) {
					return res.redirect("/" + req.session.trainer.urlName);
					//return res.json(req.session.trainer);
				});
			});
		}
		else {
			console.log("Lunge Error: auth.facebook.index.js NO req.session.trainer");
			return res.redirect("/" + req.session.trainer.urlName);
		}
	});
module.exports = router;
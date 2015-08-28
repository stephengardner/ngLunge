
var express = require('express');
var passport = require('passport');
var config = require("../../config/environment");


module.exports = function(app) {
	var Trainer = app.models.Trainer;
	var auth = require('../auth.service')(app);
	var router = express.Router();

	router
		.get('/', passport.authenticate('linkedin', {
			failureRedirect: '/signup',
			session: false,
			scope: ['r_basicprofile', 'r_fullprofile', 'r_emailaddress', 'r_contactinfo']
		}))

		.get('/callback', passport.authenticate('linkedin', {
			failureRedirect: '/signup',
			session: false
		}), auth.setTokenCookie);

// trainer link profile facebook auth
	router
		.get('/trainer-sync', auth.isTrainerMe(), passport.authenticate('linkedin', {
			scope: ['r_basicprofile', 'r_fullprofile', 'r_emailaddress', 'r_contactinfo'],
			failureRedirect: '/signup',
			session: false,
			callbackURL: config.linkedin.callbackTrainerURL
		}))
	router
		.get('/callback-trainer-sync', passport.authenticate('linkedin', {
			failureRedirect: '/signup',
			session: false,
			callbackURL: config.linkedin.callbackTrainerURL
		}), function(req, res, next) {
			if(req.session.trainer) {
				var trainer = req.session.trainer;
				Trainer.findById(req.session.trainer._id, function(err, trainer){
					var trainer = trainer;
					console.log("SETTING LINKEDIN TO BE : ", req.user.linkedin);
					trainer.linkedin = req.user.linkedin;
					trainer.save(function(err, trainer) {
						console.log("=========ABSOLUTE NEW TRAINER: \n", trainer);
						return res.redirect("/" + req.session.trainer.urlName);
						//return res.json(req.session.trainer);
					});
				});
			}
		});
	return router;
}
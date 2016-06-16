'use strict';

var express = require('express'),
	passport = require('passport'),
	config = require('../../../../../config/environment'),
	request = require('request'),
	jwt = require('jsonwebtoken'),
	expressJwt = require('express-jwt'),
	compose = require('composable-middleware'),
	validateJwt = expressJwt({ secret: config.secrets.session });
;

module.exports = function setup(options, imports, register) {
	var auth = imports.auth,
		bruteforce = imports.bruteforce,
		router = express.Router(),
		trainerModel = imports.trainerModel,
		User = trainerModel,
		facebookSatellizerRegister = imports.facebookSatellizerRegister,
		facebookSatellizerLogin = imports.facebookSatellizerLogin,
		facebookSatellizerSync = imports.facebookSatellizerSync,
		facebookSatellizer = imports.facebookSatellizer
		;

	router.post('/', facebookSatellizer,
		function (req, res, next) {
			if (req.body.type == 'trainer-register') {
				return facebookSatellizerRegister(req, res, next);
			}
			else if (req.body.type == 'trainer-login') {
				return facebookSatellizerLogin(req, res, next);
			}
			else if (req.body.type == 'trainer-sync') {
				auth.authenticate()(req, res, function(){
					return facebookSatellizerSync(req, res, next);
				});
			}
			else {
				console.log("req.body:", req.body);
				res.status(404).send({
					message: 'No thanks'
				});
			}
		}
	);
	
	register(null, {
		authFacebookRouter : router
	});
};

// router.get('/trainer-register', passport.authenticate('facebookTrainerRegister', {
// 	scope: ['email', 'user_about_me'],
// 	session: false,
// 	callbackURL: config.facebook.callbackTrainerURL
// }));


/** Working
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
			console.log("\n\nCallback req.user.facebook is:", req.user.facebook);
			if(req.session.trainer) {
				console.log("Req session trainer is here", req.session.trainer.name);
				var trainer = req.session.trainer;
				trainerModel.findById(trainer._id, function(err, trainer) {
					if(trainer) return setExistingTrainer(trainer, req).then(function(){
						res.redirect("/trainer/info");
					});
					return createNewTrainer(req).then(function(){
						auth.setTokenCookie(req, res);
						//res.redirect("/trainer/info");
					}).catch(function(err){
						logger.error(err);
						logger.error(err.message);
					});
				});
			}
			else {
				return createNewTrainer(req).then(function(){
					req.session.trainer = req.user;
					auth.setTrainerTokenAndRespond(req, res);
					//res.redirect("/trainer/info");
				}).catch(logger.error);
				// console.log("Lunge Error: auth.facebook.index.js NO req.session.trainer");
				// return res.redirect("/");
			}
		});

 function setExistingTrainer(trainer, req) {
		console.log("Setting existing trainer...");
		return new Promise(function(resolve, reject){
			trainer.facebook = req.user._json;
			trainer.save(function(err, user) {
				if(err) return reject(err);
				return resolve();
			});
		})
	}
 function createNewTrainer(req) {
		return new Promise(function(resolve, reject){
			console.log("Setting trainer.facebook to be : ", req.user._json);
			// trainer.email = req.user._.json.email;
			var newTrainerObject = {
				name : { full : 'Augie G' },
				email : req.user._json.email,
				provider : 'facebook',
				facebook : req.user._json
			};
			var newTrainer = new trainerModel(newTrainerObject);
			newTrainer.set('name.full', 'Augie Gardner');
			console.log("NEw Trainer:", newTrainer);
			newTrainer.save(function(err, saved){
				if(err) return reject(err);
				req.user = saved;
				return resolve();
			})
		})
	}
 */
'use strict';

var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../../../config/environment');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
var validateJwt = expressJwt({ secret: config.secrets.session });

var Trainer, Registration, userModel;
module.exports = function setup(options, imports, register) {
	Trainer = imports.trainerModel;//.models.Trainer;
	userModel = imports.userModel;
	var exports = {};
	exports.isAuthenticated = isAuthenticated;
	exports.isTrainerAuthenticated = isTrainerAuthenticated;
	exports.hasRole = hasRole;
	exports.signToken = signToken;
	exports.setTokenCookie = setTokenCookie;
	exports.setTrainerTokenAndRespond = setTrainerTokenAndRespond;
	exports.isTrainerMe = isTrainerMe;
	exports.isValidRegistration = isValidRegistration;
	exports.attachCorrectTrainerById = attachCorrectTrainerById;
	exports.authenticate = authenticate;
	register(null, {
		auth : exports
	})
}

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isValidRegistration(){
	return compose()
	// Attach user to request
		.use(function(req, res, next) {
			console.log("body id: ", req.params.id);
			userModel.findOne({'registration.authenticationHash' : req.params.id }, function (err, trainer) {
				if (err) return next(err);
				if (!trainer){
					console.log("shit", trainer);
					return res.send("That authorization link has already been used");
				}

				req.trainer = trainer;
				console.log("isValidRegistration() FOUND A REGISTRATION:", trainer, " and set it as req.registration");
				next();
			});
		});
}
// for some reason this is populating req.user._id as the whole req.user....
var authenticate = function(){
	console.log("auth.authenticate");
	return compose()
	// Validate jwt
		.use(function(req, res, next) {
			req.user = req.user || {};
			console.log("Req.user is...? ( should be empty ) : ", req.user);
			// allow access_token to be passed through query parameter as well
			if(req.query && req.query.hasOwnProperty('access_token')) {
				req.headers.authorization = 'Bearer ' + req.query.access_token;
			}
			validateJwt(req, res, next); // THIS is where req.user gets added!
		})
		// Attach trainer to request
		// OTHERWISE it just adds the simple _id... NOT THE ACTUAL COMPLETE OBJECT
		// Here we're checking both trainers and users.
		.use(function(req, res, next) {
			console.log("1...");
			console.log("Attach user");
			req.user = req.user || {};
			console.log("Req user is:", req.user);
			Trainer.findById(req.user._id, function (err, trainer) {
				if (err) return next(err);
				if (!trainer) {
					console.log("NO TRAINER FOUND ON ITEM.");
					userModel.findById(req.user._id, function (err, user) {
						if(!user) return res.send(401);
						req.user = user;
						console.log("ATTACHED USER:", req.user);
						next();
					});
				}
				else {
					console.log("Found trainer:", trainer.name);
					req.trainer = trainer;
					req.session.trainer = trainer;
					next();
				}
			});
		});
};

var attachCorrectTrainerById = function() {
	return compose()
	// Attach user to request
		.use(function(req, res, next) {
			// if(req.params && req.params.id) {
			// 	console.log("The request params id is:", req.params.id);
			// }
			// // The admin is updating a user but the user is NOT the admin user.
			// // So basically, we attached a trainer to the request but it wasn't the one we're looking to update
			// // so now, attach the right one.
			// console.log("*\n*\n*\nThe request user is:", req.user, "\n*\n*\n");
			//
			// // it's a normal user updating themselves
			// if(req.user._id == req.params.id) {
			// 	console.log("Someone is updating themselves");
			// 	Trainer.findById(req.params.id, function (err, trainer) {
			// 		if (err) return next(err);
			// 		else {
			// 			req.trainer = trainer;
			//
			// 			// IMPORTANT, FOR LINKING SOCIAL URLS
			// 			// for passport facebook linking, we log in using passport but we lose the trainer object
			// 			// so set the trainer object in the session, for this case
			// 			req.session.trainer = trainer;
			//
			// 			next();
			// 		}
			// 	});
			// }
			// else {
			// 	console.log("The req.user.id was :", req.user.id, " but the req params id was: ", req.params.id);
			// 	// it's an admin updating someone else
			// 	console.log("An admin is updating someone else");
			// 	Trainer.findById(req.user._id, function(err, trainer){
			// 		if(err) return next(err);
			// 		if(trainer.email == 'opensourceaugie@gmail.com') {
			// 			Trainer.findById(req.params.id, function(err, otherTrainer){
			// 				if(err) return next(err);
			// 				req.trainer = otherTrainer;
			//
			// 				// IMPORTANT, FOR LINKING SOCIAL URLS
			// 				// for passport facebook linking, we log in using passport but we lose the trainer object
			// 				// so set the trainer object in the session, for this case
			// 				req.session.trainer = otherTrainer;
			// 				next();
			// 			})
			// 		}
			// 		else {
			// 			next(new Error("Unauthorized token in auth service"));
			// 		}
			// 	})
			// }
			next();
		});
};

// an almost complete replica of express-jwt which mimics what the jwt verification is doing EXCEPT it doesn't throw any errors
// so, on an api endpoint, when we call isTrainerMe() we can check the JWT and set the user.  If there is no JWT aka
// no one is logged in, then that's fine.  But if there is a JWT, we will get the current user, and then when pinging the
// trainers/:id we will see if the trainer we received matches the trainer that's logged in.  And then set trainer.me = true
var optionalJwt = function(options) {
	if (!options || !options.secret) throw new Error('secret should be set');

	return function(req, res, next) {
		var token;
		if (req.method === 'OPTIONS' && req.headers.hasOwnProperty('access-control-request-headers')) {
			for (var ctrlReqs = req.headers['access-control-request-headers'].split(','),i=0;
			     i < ctrlReqs.length; i++) {
				if (ctrlReqs[i].indexOf('authorization') != -1)
					return next();
			}
		}

		if (typeof options.skip !== 'undefined') {
			if (options.skip.indexOf(req.url) > -1) {
				return next();
			}
		}

		if (req.headers && req.headers.authorization) {
			var parts = req.headers.authorization.split(' ');
			if (parts.length == 2) {
				var scheme = parts[0]
					, credentials = parts[1];

				if (/^Bearer$/i.test(scheme)) {
					token = credentials;
				}
			} else {
				return next();//new UnauthorizedError('credentials_bad_format', { message: 'Format is Authorization: Bearer [token]' }));
			}
		} else {
			return next();//new UnauthorizedError('credentials_required', { message: 'No Authorization header was found' }));
		}

		jwt.verify(token, options.secret, options, function(err, decoded) {
			if (err) return next();//new UnauthorizedError('invalid_token', err));

			req.user = decoded;
			next();
		});
	};
};

// used for profile
function isTrainerMe() {
	return compose()
	// Validate jwt
		.use(function(req, res, next) {
			// allow access_token to be passed through query parameter as well
			if(req.params.accessToken) {
				req.headers.authorization = 'Bearer ' + req.params.accessToken;
			}
			else if(req.query && req.query.hasOwnProperty('access_token')) {
				req.headers.authorization = 'Bearer ' + req.query.access_token;
			}
			try{
				var optionalVerifyJwt = optionalJwt({ secret: config.secrets.session });
				optionalVerifyJwt(req, res, next); // THIS is where req.user gets added!
			}
			catch(err) {
				console.log("ERROR!!!\n-------------------\nRequest is: ", req);
				console.log("config.secrets is: ", config.secrets);
				console.log("The err:",err);
				console.log("WWWW");
			}
		})
		// Attach user to request
		.use(function(req, res, next) {
			if(req.user) {
				Trainer.findById(req.user._id, function (err, trainer) {
					if (err) return next(err);
					else {
						req.trainer = trainer;

						// IMPORTANT, FOR LINKING SOCIAL URLS
						// for passport facebook linking, we log in using passport but we lose the trainer object
						// so set the trainer object in the session, for this case
						req.session.trainer = trainer;

						next();
					}
				});
			}
			else {
				next();
			}
		});
}

function isTrainerAuthenticated() {
	return compose()
	// Validate jwt
		.use(function(req, res, next) {
			// allow access_token to be passed through query parameter as well
			if(req.query && req.query.hasOwnProperty('access_token')) {
				req.headers.authorization = 'Bearer ' + req.query.access_token;
			}
			validateJwt(req, res, next); // THIS is where req.user gets added!
		})
		// Attach user to request
		.use(function(req, res, next) {
			Trainer.findById(req.user._id, function (err, trainer) {
				if (err) return next(err);
				if (!trainer) {
					//User.findById(req.user._id, function (err, user) {
					//	if(!user) return res.send(401);
					//	req.user = user;
					//	next();
					//});
					req.trainer = {};
					next();
				}
				else {
					req.trainer = trainer;
					next();
				}
			});
		});
}


function isAuthenticated() {
	return compose()
	// Validate jwt
		.use(function(req, res, next) {
			// allow access_token to be passed through query parameter as well
			if(req.query && req.query.hasOwnProperty('access_token')) {
				req.headers.authorization = 'Bearer ' + req.query.access_token;
			}
			req.body.type = "trainer";
			validateJwt(req, res, next); // THIS is where req.user gets added!
		})
		// Attach user to request
		.use(function(req, res, next) {
			//console.log("auth.service.isAuthenticated() req.trainer = " , req.body);
			//console.log("auth.service.isAuthenticated() req.user = ", req.user, " NOTE: make sure it has req.user.type!");
			if(req.user.type == "trainer") {
				Trainer.findById(req.user._id, function (err, trainer) {
					if (err) return next(err);
					req.trainer = trainer;
					next();
				});
			}
			else {
				next();
				// User.findById(req.user._id, function (err, user) {
				// 	if(!user) return res.send(401);
				// 	req.user = user;
				// 	next();
				// });
			}
		});
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {
	if (!roleRequired) throw new Error('Required role needs to be set');

	return compose()
		.use(isAuthenticated())
		.use(function meetsRequirements(req, res, next) {
			if (config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
				next();
			}
			else {
				res.send(403);
			}
		});
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id) {
	return jwt.sign({ _id: id }, config.secrets.session, { expiresInMinutes: 60*5 });
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
	if (!req.user) return res.json(404, { message: 'Something went wrong, please try again.'});
	console.log("Setting token cookie for: ", req.user);
	var token = signToken(req.user._id, req.user.role);
	res.cookie('token', JSON.stringify(token));
	var type = req.user.type ? req.user.type : "user";
	res.cookie('type', JSON.stringify(type));
	res.redirect('/');
}

function setTrainerTokenAndRespond(req, res) {
	var type = "user";
	console.log("Req user is:", req.user);
	var token = signToken(req.user._id, type);
	console.log("token is:", JSON.stringify(token));
	res.cookie('token', JSON.stringify(token));
	res.cookie('type', JSON.stringify(type));
	console.log("Redirecting to /trainer/info");
	res.redirect('/');
	// res.json({token: token, type : req.body.type});
}
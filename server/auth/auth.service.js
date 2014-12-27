'use strict';

var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/environment');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
var User = require('../api/user/user.model');
var Trainer = require('../api/trainer/trainer.model');
var Registration = require('../api/registration/registration.model');
var validateJwt = expressJwt({ secret: config.secrets.session });

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isValidRegistration(){
	return compose()
		// Attach user to request
		.use(function(req, res, next) {
			console.log("body id: ", req.body.id, req.body._id);
			console.log("body id: ", req.params.id, req.params._id);
			Registration.findById(req.params.id, function (err, registration) {
				if (err) return next(err);
				if (!registration){
					console.log("shit", registration);
					return res.send("That authorization link has already been used");
				}

				req.registration = registration;
				console.log("isValidRegistration() FOUND A REGISTRATION:", registration, " and set it as req.registration");;
				next();
			});
		});
}
/* // not sure if i should delete this or not?
function isUserAuthenticated() {
	return compose()
		// Validate jwt
		.use(function(req, res, next) {
			console.log("!!!!!!!!!!CHEKCING AUTH.SERVICE IS AUTH()!!!!!!!!!!!!!!!!!!");
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
					User.findById(req.user._id, function (err, user) {
						if(!user) return res.send(401);
						req.user = user;
						next();
					});
				}
				else {
					req.trainer = trainer;
					next();
				}
			});
		});
}
*/

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

		console.log("=+= req.headers:: ", req.headers);
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

		console.log("=+= token before jwt.verify: ", token);
		jwt.verify(token, options.secret, options, function(err, decoded) {
			console.log("=+= jq.verify verified me as: ", decoded);
			if (err) return next();//new UnauthorizedError('invalid_token', err));

			req.user = decoded;
			next();
		});
	};
};

// used for profile
function isTrainerMe() {
	console.log(">> isTrainerMe()");
	return compose()
		// Validate jwt
		.use(function(req, res, next) {
			console.log("------------------------------------");
			console.log(req.cookies);
			console.log("------------------------------------");
			console.log(">> isTrainerMe inside use1()");
			// allow access_token to be passed through query parameter as well
			if(req.params.accessToken) {
				req.headers.authorization = 'Bearer ' + req.params.accessToken;
			}
			else if(req.query && req.query.hasOwnProperty('access_token')) {
				req.headers.authorization = 'Bearer ' + req.query.access_token;
			}
			/*
			else if(req.cookies && req.cookies.token){
				console.log("*** WARNING ***, using cookies to authenticate the user.  This is NOT what the app came prepackaged to do!");
				req.headers.authorization = 'Bearer ' + req.cookies.token;
			}
			*/
			try{
				var optionalVerifyJwt = optionalJwt({ secret: config.secrets.session });
				optionalVerifyJwt(req, res, next); // THIS is where req.user gets added!
			}
			catch(err) {
				console.log("The err:",err);
				console.log("WWWW");
			}
		})
		// Attach user to request
		.use(function(req, res, next) {
			console.log(">> isTrainerMe inside use2()");
			if(req.user) {
				console.log (">> req.user is: ", req.user);
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
			console.log("!!!!!!!!!!CHEKCING AUTH.SERVICE IS AUTH()!!!!!!!!!!!!!!!!!!");
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
					User.findById(req.user._id, function (err, user) {
						if(!user) return res.send(401);
						req.user = user;
						next();
					});
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
		  //console.log("!!!!!!!!!!CHEKCING AUTH.SERVICE IS AUTH()!!!!!!!!!!!!!!!!!!");
      // allow access_token to be passed through query parameter as well
      if(req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = 'Bearer ' + req.query.access_token;
      }
		  console.log("REQ BODY:", req.body);
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
			  User.findById(req.user._id, function (err, user) {
				  if(!user) return res.send(401);
				  req.user = user;
				  next();
			  });
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

exports.isAuthenticated = isAuthenticated;
exports.isTrainerAuthenticated = isTrainerAuthenticated;
exports.hasRole = hasRole;
exports.signToken = signToken;
exports.setTokenCookie = setTokenCookie;
exports.isValidRegistration = isValidRegistration;
exports.isTrainerMe = isTrainerMe;
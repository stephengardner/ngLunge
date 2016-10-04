var _ = require('lodash'),
	config = require('../../../../config/environment'),
	crypto = require('crypto'),
	jwt = require('jsonwebtoken'),
	async = require('async')
	;
module.exports = function setup(options, imports, register) {
	var Registration = imports.registrationModel,
		Trainer = imports.trainerModel,
		userModel = imports.userModel,
		registrationTrainerSignUp = imports.registrationTrainerSignUp,
		trainerPopulator = imports.trainerPopulator,
		bruteforce = imports.bruteforce
		;
	/**
	 * Get a single registration
	 */
	String.prototype.toObjectId = function() {
		var ObjectId = (require('mongoose').Types.ObjectId);
		return new ObjectId(this.length != 12 ? "DONTVALIDATE" : this.toString());
	};
	var validationError = function(res, err) {
		return res.json(422, err);
	};

	var customValidationError = function(res, errField, errMessage) {
		var err = {
			message : 'Custom Validation Failed',
			name : 'CustomValidationError',
			errors : {
			}
		};
		err.errors[errField] = {
			message : errMessage,
			name : 'CustomValidationError',
			path : errField,
			type : 'custom'
		};
		return validationError(res, err);
	};

	function handleError(res, err) {
		console.log("There was an error and logger should be outputting it...");
		logger.error(err);
		return res.send(500, err);
	}

	var exports = {};


	// Get list of things
	exports.index = function(req, res) {
		Registration.find(function (err, trainers) {
			if(err) { return handleError(res, err); }
			return res.json(200, trainers);
		});
	};

	exports.show = function (req, res, next) {
		Registration.findOne( {$or : [ { '_id' : req.params.id.toObjectId() }, { 'authenticationHash' : req.params.id }]}, function(err, registration) {
			if(err) return next(err);

			if(!registration) return res.send(404, "Invalid registration link");
			console.log("............");
			res.json(registration);
		});
	};

	exports.getTrainerByAuthenticationHash = function (req, res, next) {
		console.log("get trainer by authentication hash");
		Trainer.findOne( {
			$or : [
				{ '_id' : req.params.id.toObjectId() },
				{ 'registration.authenticationHash' : req.params.id }
			]}, function(err, trainer) {
			if(err) return next(err);
			if(!trainer) return res.send(404);
			if(trainer.registration.password_set) {
				return handleError(res, {error : 'password_set'});
			}

			console.log("............");
			res.json(trainer);
		});
	};

	exports.test = function(req, res) {
		Registration.create({email : req.params.email}, function(err, registration) {
			if(err) { return handleError(res, err); }
			return res.json(201, registration);
		});
	};

	exports.create = function(req, res) {
		console.log("Req body: ", req.body);
		req.body = req.body && req.body.email ? req.body : { email : ""};

		if(req.body.type == 'user') {
			return res.json({user : {}});
		}
		else {
			Trainer.findOne({
				email : req.body.email,
				'registration_providers.local' : true
			}).exec(function(err, found) {
				if(err) return handleError(res, err);
				if(found) {
					console.log("FOUND TRAINER IS:", found._id);
				}
				if(found && found.registration.email_verified) { // let it error out properly
					createTrainer();
				}
				else if(!found) { // create the trainer
					createTrainer();
				}
				else { // found and not authenticated yet, resend the email
					found.registration.authenticationHash = crypto.randomBytes(20).toString('hex');
					found.save(function(err, saved){
						if(err) return handleError(res, err);
						sendEmail(saved);
					});
				}
			});
			function sendEmail(trainer) {
				async.waterfall([
					function brute(callback) {
						bruteforce.trainerRegistration.prevent(req, res, callback);
					},
					function send(callback) {
						registrationTrainerSignUp.sendEmail(trainer).then(function(){
							callback(null);
						}).catch(callback)
					}

				], function(err, response){
					if(err) return handleError(res, err);
					return res.json({trainer : trainer});
				});
			}
			function createTrainer() {
				var createTrainerFrom = _.merge(
					req.body,
					{
						provider : 'local',
						registration: {
							authenticationHash: crypto.randomBytes(20).toString('hex')
						}
					}
				);
				var newTrainer = new Trainer(createTrainerFrom);
				console.log("Created new trainer object:", newTrainer);
				newTrainer.save(function(err, savedTrainer){
					if(err) {
						console.log("ERROR ON SAVE:", err);
						return handleError(res, err);
					}
					else {
						sendEmail(savedTrainer);
					}
				});
			}
		}
	};

	exports.resendEmail = function(req, res) {
		var populatedTrainer,
			savedTrainer
			;
		async.waterfall([
			function populate(callback) {
				trainerPopulator.populate(req.body.trainer).then(function(response){
					populatedTrainer = response;
					callback();
				}).catch(callback);
			},
			function brute(callback) {
				bruteforce.trainerRegistration.prevent(req, res, callback);
			},
			function createNewHash(callback) {
				populatedTrainer.registration.authenticationHash = crypto.randomBytes(20).toString('hex');
				populatedTrainer.save(function(err, saved) {
					savedTrainer = saved;
					if(err) return callback(err);
					return callback();
				})
			},
			function sendEmail(callback) {
				registrationTrainerSignUp.sendEmail(savedTrainer).then(function(){
					callback();
				}).catch(callback)
			}
		], function(err, response){
			if(err) return handleError(res, err);
			return res.json({trainer : savedTrainer});
		})
	};

	exports.validateEmail = function(req, res) {
		Trainer.findOne({
			'registration.authenticationHash' : req.params.id
		}).exec(function(err, trainer){
			console.log("Trainers email:", trainer.email);
			if(err) {return handleError(res, err);}
			if(!trainer) { return res.status(404)}
			trainer.registration.email_verified = true;
			trainer.registration_providers.local = true;
			trainer.save(function(err, savedTrainer){
				if(err) { return handleError(res, err); }
				return res.json(savedTrainer);
			})
		});
	};

	exports.submitPassword = function(req, res) {
		console.log("Attempting to submit password with trainer:", req.trainer);

		var trainerId = req.trainer._id;
		var password1 = String(req.body.password);
		var password2 = String(req.body.password2);

		if(password1 !=  password2) {
			return customValidationError(res, 'password2', 'Passwords must match');
		}
		if(password1.length < 6) {
			return customValidationError(res, 'password', 'Password must be at least 6 characters long');
		}
		if(password1.length >= 16) {
			return customValidationError(res, 'password', 'Password must be less than 16 characters long');
		}
		Trainer.findById(trainerId).exec(function(err, trainer){
			if(trainer.registration && trainer.registration.password_set) {
				return customValidationError(res, 'trainer', 'You\'re password is already set.  Please log-in');
			}
			var trainerProperties = {
				name : {
					first : "Anonymous",
					last : "Trainer"
				},
				registration : {
					password_set : true
				},
				type : "in-home",
				password : password1,
				role : "trainer"
			};
			trainer = _.merge(trainer, trainerProperties);
			trainer.save(function(err, trainer){
				console.log("The error was:", err);
				console.log("SAVED:", trainer);
				if (err) return validationError(res, err);
				var token = jwt.sign({_id: trainer._id }, config.secrets.session, { expiresInMinutes: 60*5 });
				var type = "trainer";
				res.cookie('token', JSON.stringify(token));
				res.cookie('type', JSON.stringify(type));
				res.json({ trainer : trainer });
			});
		});
	};

	register(null, {
		apiRegistrationController : exports
	})
}

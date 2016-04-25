var _ = require('lodash'),
	config = require('../../../../config/environment'),
	crypto = require('crypto'),
	jwt = require('jsonwebtoken')
;
module.exports = function setup(options, imports, register) {
	var Registration = imports.registrationModel,
		Trainer = imports.trainerModel,
		registrationTrainerSignUp = imports.registrationTrainerSignUp
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
	function handleError(res, err) {
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
		Trainer.findOne( {$or : [ { '_id' : req.params.id.toObjectId() }, { 'registration.authenticationHash' : req.params.id }]}, function(err, trainer) {
			if(err) return next(err);

			if(!trainer) return res.send(404, "Invalid registration link");
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
		req.body = req.body && req.body.email ? req.body : { email : ""};
		var createTrainerFrom = _.merge({
			email : '',
			registration : {
				authenticationHash : crypto.randomBytes(20).toString('hex')
			}
		}, req.body);
		var newTrainer = new Trainer(createTrainerFrom);

		console.log("New trainer:", newTrainer);
		newTrainer.save(function(err, savedTrainer){
			if(err) {
				return handleError(res, err);
			}
			else {
				registrationTrainerSignUp.sendEmail(savedTrainer).then(function(){
					return res.json({trainer : savedTrainer});
				}).catch(function(err){
					return handleError(res, err);
				})
			}
		})
		//});
	};

	exports.validateEmail = function(req, res) {
		Trainer.find({
			'registration.authenticationHash' : req.params.id
		}).exec(function(err, trainer){
			if(err) {return handleError(res, err);}
			if(!trainer) { return res.status(404)}
			trainer.registration.authenticated = true;
			trainer.save(function(err, savedTrainer){
				if(err) { return handleError(res, err); }
				return res.json(201, savedTrainer);
			})
		});
	};

	exports.submitPassword = function(req, res) {
		console.log("Attempting to submit password with trainer:", req.trainer);

		var trainerId = req.trainer._id;
		var password1 = String(req.body.password ? req.body.password : "");
		var password2 = String(req.body.password2);

		Trainer.findById(trainerId).exec(function(err, trainer){
			var trainerProperties = {
				name : {
					first : "Anonymous",
					last : "Trainer"
				},
				registration : {
					verified : true
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
				res.json({ trainer : trainer, token: token });
			});
		});
	};

	register(null, {
		apiRegistrationController : exports
	})
}

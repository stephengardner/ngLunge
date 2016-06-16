var jwt = require('jsonwebtoken'),
	request = require('request'),
	config = require('../../../../../../config/environment'),
	graph = require('fbgraph'),
	_ = require('lodash')
	;
module.exports = function setup(options, imports, register){
	var trainerModel = imports.trainerModel,
		auth = imports.auth,
		createJWT = auth.signToken;
	var facebookSatellizerRegister = function(req, res, next) {
		var profile = req.profile,
			provider = 'facebook'
			;
		trainerModel.findOne({ 'email': profile.email }, function(err, existingUser) {
			if (existingUser && existingUser.registration_providers[provider] == profile.id) {
				return res.status(409).send({
					message: 'There is already a ' +
					'' + provider.capitalize() +
					' account that belongs to you, try logging in'
				});
			}
			else if(existingUser) {
				addRegistrationToExistingTrainer(trainer);
			}
			createNewTrainer();
		});
		function addRegistrationToExistingTrainer(trainer) {
			trainer.registration_providers[provider] = profile.id;
			trainer[provider] = JSON.parse(JSON.stringify(profile));
			trainer.save(function(err, saved){
				if(err) return res.status(500).send(err);
				sendResponse(trainer);
			})
		}
		function createNewTrainer(){
			var user = new trainerModel();
			setTrainerBasedOnFacebookDetails(user).then(function(response){
				user.save(function(err, saved) {
					if(err) return res.status(500).send(err);
					sendResponse(user);
				});
			}).catch(function(err){
				console.log(err);
			});
		}
		function setTrainerBasedOnFacebookDetails(trainer) {
			return new Promise(function(resolve, reject){
				trainer.registration_providers[provider] = profile.id;
				trainer[provider] = JSON.parse(JSON.stringify(profile));
				trainer.email = profile.email;
				trainer.name.full = profile.name;
				return resolve(trainer);
			});
		}
		function sendResponse(trainer) {
			var token = createJWT(trainer);
			console.log("CREATED USER\n\n");
			res.cookie('token', JSON.stringify(token));
			res.cookie('type', JSON.stringify('trainer'));
			res.send({ token: token, type : 'trainer', trainer : trainer });
		}
	};
	register(null, {
		facebookSatellizerRegister : facebookSatellizerRegister
	});
};
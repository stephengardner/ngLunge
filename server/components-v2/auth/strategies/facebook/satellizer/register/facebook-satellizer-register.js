var jwt = require('jsonwebtoken'),
	request = require('request'),
	config = require('../../../../../../config/environment'),
	graph = require('fbgraph'),
	_ = require('lodash')
	;
String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}
module.exports = function setup(options, imports, register){
	var trainerModel = imports.trainerModel,
		traineeModel = imports.traineeModel,
		auth = imports.auth,
		createJWT = auth.signToken;
	var facebookSatellizerRegister = function(req, res, next) {
		var profile = req.profile,
			provider = 'facebook',
			type,
			Model
			;
		if(req.body.type && req.body.type.indexOf('trainee') != -1) {
			type = "trainee";
			Model = traineeModel;
		}
		else {
			type = "trainer";
			Model = trainerModel;
		}
		console.log("facebookSatellizerRegister registering for type: " + type);
		Model.findOne({ 'email': profile.email }, function(err, existingUser) {
			if (existingUser && existingUser.registration_providers[provider] == profile.id) {
				return res.status(409).send({
					message: 'There is already a ' +
					'' + provider.capitalize() +
					' account that belongs to you, try logging in'
				});
			}
			else if(existingUser) {
				addRegistrationToExistingDocument(existingUser);
			}
			createNewDocument();
		});
		function addRegistrationToExistingDocument(document) {
			document.registration_providers[provider] = profile.id;
			document[provider] = JSON.parse(JSON.stringify(profile));
			document.save(function(err, saved){
				if(err) return res.status(500).send(err);
				sendResponse(document);
			})
		}
		function createNewDocument(){
			console.log("Creating a new " + type);
			var user = new Model();
			setDocumentBasedOnFacebookDetails(user).then(function(response){
				response.save(function(err, saved) {
					if(err) {
						console.log("Uhhh, error:", err);
						return res.status(500).send(err);
					}
					sendResponse(user);
				});
			}).catch(function(err){
				console.log(err);
			});
		}
		function setPicture(document) {
			if(type == "trainee") {
				if(document.profile_picture && !document.profile_picture.thumbnail.url) {
					document.profile_picture.thumbnail.url = profile.picture.graph.url;
				}
			}
		}
		function setDocumentBasedOnFacebookDetails(user) {
			return new Promise(function(resolve, reject){
				user.registration_providers[provider] = profile.id;
				user[provider] = JSON.parse(JSON.stringify(profile));
				user.email = profile.email;
				user.name.full = profile.name;
				setPicture(user);
				console.log("Created " + type + ": ", user);
				return resolve(user);
			});
		}
		function sendResponse(user) {
			var token = createJWT(user);
			console.log("SENDING type: " + type + " \n\n");
			res.cookie('token', JSON.stringify(token));
			res.cookie('type', JSON.stringify(type));
			var returnObject = {
				token : token,
				type : type
			};
			returnObject[type] = user;
			res.send(returnObject);
		}
	};
	register(null, {
		facebookSatellizerRegister : facebookSatellizerRegister
	});
};
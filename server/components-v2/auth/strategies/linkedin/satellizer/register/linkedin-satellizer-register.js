var jwt = require('jsonwebtoken'),
	request = require('request'),
	config = require('../../../../../../config/environment'),
	graph = require('fbgraph'),
	_ = require('lodash')
	;
module.exports = function setup(options, imports, register){
	var trainerModel = imports.trainerModel,
		auth = imports.auth,
		userModel = imports.userModel,
		createJWT = auth.signToken;
	var linkedinSatellizerRegister = function(req, res) {
		var profile = req.profile,
			provider = 'linkedin',
			type,
			Model
			;
		if(req.body.type && req.body.type.indexOf('trainee') != -1) {
			type = "trainee";
			Model = userModel;
		}
		else {
			type = "trainer";
			Model = trainerModel;
		}

		console.log("linedinSatellizerRegister registering for type: " + type);
		Model.findOne({ 'email' : profile.emailAddress }, function(err, existingUser) {
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
			else {
				createNewDocument();
			}
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
			var document = new Model();
			setDocumentDetails(document).then(function(response){
				document.save(function(err, saved) {
					if(err) return res.status(500).send(err);
					sendResponse(document);
				});
			}).catch(function(err){
				console.log(err);
			});
		}
		function setDocumentDetails(document) {
			return new Promise(function(resolve, reject){
				document.registration_providers[provider] = profile.id;
				document[provider] = JSON.parse(JSON.stringify(profile));
				document.email = profile.emailAddress;
				document.name.full = profile.firstName + " " + profile.lastName;
				setPicture(document);
				return resolve(document);
			});
		}
		function setPicture(document) {
			if(type == "trainee") {
				if(document.profile_picture && !document.profile_picture.thumbnail.url) {
					console.log(profile);
					document.profile_picture.thumbnail.url = profile.pictureUrl;
				}
			}
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
		linkedinSatellizerRegister : linkedinSatellizerRegister
	})
}
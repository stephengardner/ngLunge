var async = require('async'),
	expect = require('chai').expect,
	_ = require('lodash'),
	config = require('../../../../config/environment'),
	mandrill = require('node-mandrill')(config.mandrill.API_KEY),
	sendgrid = require("sendgrid").SendGrid(config.sendgrid.clientSecret)
	rp = require('request-promise')
	;
;
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

var validationError = function(res, err) {
	logger.error(err);
	return res.status(422).json(err);
};

module.exports = function setup(options, imports, register) {
	var trainerModel = imports.trainerModel,
		bruteforce = imports.bruteforce
	;
	var trainerContactEmail = {
		send : function(req, res){
			send(req, res).then(function(response){
				res.status(200).json({});
			}).catch(function(err){
				if(err.code == 500) {
					return res.status(500).json(err);
				}
				return validationError(res, err);
			})
		}
	};

	function send(req, res) {
		return new Promise(function(resolve, reject){
			var trainerId = req.params.id;
			expect(trainerId).to.exist;
			expect(req.body.inquiry).to.exist;
			expect(req.body.inquiry.user).to.exist;
			expect(req.body.inquiry.user.name).to.exist;

			var trainer, inquiryAddedIndex = false,
				inquiry = req.body.inquiry,
				user = req.body.user,
				newEmailInquiry
				;

			async.waterfall([
				function getTrainer(callback) {
					trainerModel.findById(trainerId).exec(function(err, foundTrainer){
						if(err) return callback(err);
						if(!foundTrainer) return callback(new Error(404));
						trainer = foundTrainer;
						callback(null);
					})
				},
				function createEmailInquiry(callback) {
					newEmailInquiry = {
						user : {
							reference : req.user._id,
							name : _.merge({}, req.user.name),
							email : req.user.email
						},
						message : req.body.inquiry.message
					};
					callback();
				},
				function validate(callback) {
					trainer.email_inquiries.push(newEmailInquiry);
					trainer.validate(function(err, validatedTrainer){
						if(err) return callback(err);
					});
				},
				function validateUser(callback) {
					req.user.email_inquiries.push(newEmailInquiry);
					req.user.validate(function(err, validated){
						if(err) return callback(err);
						callback(null);
					})
				},
				function brute(callback) {
					bruteforce.trainerContactInquiry.prevent(req, res, callback);
				},
				function bruteDaily(callback) {
					bruteforce.trainerContactInquiryMaxDaily.prevent(req, res, callback);
				},
				function addEmailInquiryToTrainer(callback) {
					trainer.save(function(err, savedTrainer){
						if(err) return callback(err);
						trainer = savedTrainer;
						inquiryAddedIndex = savedTrainer.email_inquiries.length -1;
						callback(null);
					})
				},
				function addEmailInquiryToUser(callback) {
					req.user.save(function(err, savedTrainer){
						if(err) return callback(err);
						trainer = savedTrainer;
						inquiryAddedIndex = savedTrainer.email_inquiries.length -1;
						callback(null);
					})
				},
				function sendInquiry(callback) {
					console.log("body.inquiry is:", req.body.inquiry);
					console.log("domain is:", config.DOMAIN);
					console.log("urlanme is:", trainer.urlName);
					var request = sendgrid.emptyRequest();
					request.method = 'POST';
					request.path = '/v3/mail/send';
					request.body = {
						"from": {
							"email": "messages@golunge.com"
						},
						"personalizations": [
							{
								"to": [
									{
										"email": "opensourceaugie@gmail.com"
									}
								],
								"substitutions" : {
									"-name-" : newEmailInquiry.user.name.first + " " + newEmailInquiry.user.name.last,
									"-email-" : newEmailInquiry.user.email,
									"-message-" : newEmailInquiry.message,
									"-domain-" : config.DOMAIN,
									"-url_name-" : trainer.urlName
								}
							}
						],
						"content" : [
							{
								"type" : "text/html",
								"value" : "."
							}
						],
						"template_id": "bde37a68-1bea-4114-b4dc-df7e55877f37",
						"category": [
							"inquiry"
						]
					};
					sendgrid.API(request, function (response) {
						// console.log('resposne:', response);
						console.log('code:' , response.statusCode);
						console.log(response.body);
						console.log(response.headers);
						callback();
					});
				}
			], function(err, response){
				if(err) return reject(err);
				return resolve(response);
			})
		})
	}
	register(null, {
		trainerContactEmail : trainerContactEmail
	})
}
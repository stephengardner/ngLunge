var Promise = require('promise'),
	async = require('async'),
	expect = require('chai').expect,
	_ = require('lodash'),
	config = require('../../../../config/environment'),
	mandrill = require('node-mandrill')(config.mandrill.API_KEY)
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
}
var validationError = function(res, err) {
	logger.error(err);
	return res.status(422).json(err);
};
module.exports = function setup(options, imports, register) {
	var trainerModel = imports.trainerModel;
	var trainerContactEmail = {
		send : function(req, res){
			send(req, res).then(function(response){
				res.status(200).json({});
			}).catch(function(err){
				//if(err.type == 'mandrill') {
				//	return customValidationError(res, 'mandrill', err.message);
				//}
				if(err.code == 500) {
					return res.status(500).json(err);
				}
				return validationError(res, err);
			})
		}
	}
	function send(req, res) {
		return new Promise(function(resolve, reject){
			expect(req).to.have.property('body');
			expect(req.body).to.have.property('trainer');
			var trainer, inquiryAddedIndex = false
			;

			function attachMandrillResponse(error, response) {
				return new Promise(function(resolve, reject){
					if(inquiryAddedIndex !== false) {
						console.log("Trainer email inquiries are:", trainer.email_inquiries);
						console.log("and the index is:", inquiryAddedIndex);
						if(error) {
							trainer.email_inquiries[inquiryAddedIndex].mandrill_error = error;
						}
						else {
							trainer.email_inquiries[inquiryAddedIndex].sent++;
							trainer.email_inquiries[inquiryAddedIndex].mandrill_success = response[0]
						}
						trainer.save(function(err, savedTrainer){
							if(err) return reject(err);
							return resolve(savedTrainer);
						})
					}
					else {
						return reject(false);
					}
				})
			}
			async.waterfall([
				function getTrainer(callback) {
					trainerModel.findById(req.body.trainer._id).exec(function(err, foundTrainer){
						if(err) return callback(err);
						if(!foundTrainer) return callback(new Error(404));
						trainer = foundTrainer;
						callback(null);
					})
				},
				function addEmailInquiry(callback) {
					var newEmailInquiry = _.merge({}, req.body.inquiry);
					trainer.email_inquiries.push(newEmailInquiry);
					trainer.save(function(err, savedTrainer){
						if(err) return callback(err);
						trainer = savedTrainer;
						inquiryAddedIndex = savedTrainer.email_inquiries.length -1;
						callback(null);
					})
				},
				function sendInquiry(callback) {
					//var newEmailInquiry = _.merge({}, req.body.inquiry);
					//trainer.email_inquiries.push(newEmailInquiry);
					var options = {
						template_name : 'trainer-inquiry-v1-1',
						template_content : [],
						message : {
							to : [{email : 'opensourceaugie@gmail.com'}],
							merge_language : "handlebars",
							inline_css : true,
							subject : 'You\'ve got a new Lunge message!',
							global_merge_vars : [
								{
									name : 'trainer',
									content : req.body.trainer
								},
								{
									name : 'inquiry',
									content : req.body.inquiry
								}
							]
						}
					}
					mandrill('messages/send-template', options, function(error, response){
						attachMandrillResponse(error, response).then(function(unusedSavedTrainerResponse){
							if(error) {
								// catch the mandirll error and display a custom validation error
								var err = new Error();
								err.message = 'Something went wrong and your message was not sent ' +
								'please try again later';
								err.code = 500;
								err.type = 'mandrill';
								return callback(err);
							}
							return callback(null);
						}).catch(callback);
					});
				},
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
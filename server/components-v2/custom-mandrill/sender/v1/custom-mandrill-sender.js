
var config = require('../../../../config/environment'),
	mandrill = require('node-mandrill')(config.mandrill.API_KEY),
	async = require("async"),
	Promise = require("promise"),
	_ = require("lodash"),
	logger = require("../../../../components/logger")(),
	expect = require("chai").expect;
;
module.exports = function(options, imports, register){
	var emailLogger = require('winston').loggers.get('emailSending');
	var loggerType = "custom-mandrill-sender";
	var emailModel = imports.emailModel;
	var adminEmail = "apartminty-admin-testing@googlegroups.com" // todo relocate this
	var CustomMandrillSender = {
		_simpleCreateParams : function(options){
			var to = [], email, user = options.user;
			if(!options.email) {
				expect(options).to.have.property('user');
				expect(options.user).to.have.property('email');
			}
			if(options.email) {
				email = options.email;
			}
			else if(user){
				if(user.testing){
					email = adminEmail;
				}
				else {
					email = user.email;
				}
			}
			else {
				email = config.email.admin;
			}
			if(options.testing) {
				to = [{email : adminEmail}]
			}
			else {
				to = [{email : email}]
			}
			return {
				template_name: options.template_name,
				template_content: [],
				message: {
					to: to,
					merge_language: options.merge_language || "handlebars",
					inline_css : true,
					global_merge_vars: options.global_merge_vars
				}
			}
		},

		_send : function(options) {
			return new Promise(function(resolve, reject){
				emailLogger.info("customMandrill._send() called, sending template name :'" + options.template_name + "'");
				//logger.info({ options : options , msg : "sending options"});
				mandrill('messages/send-template', options, function(error, response){
					if(error) return reject(error);
					// mandrill comes back with a remove function attached to this response object. remove it.
					if(response) {
						delete response.remove;
					}
					//emailLogger.info({ type : logger, response : response});
					return resolve(response);
				})
			})
		}
		/* I don't believe this is used
		 ,
		 _save : function(response, options) {
		 return new Promise(function(resolve, reject){
		 emailLogger.info("customMandrill._save() called with a response from mandrill's api: ", response);
		 var response = response && response[0] ? response[0] : response;

		 // construct the email to be saved
		 var emailObj = {
		 _mandrillResponse : response,
		 mandrill_id : response._id
		 };
		 emailObj = _.merge(emailObj, options);

		 // save the email
		 emailObj = new emailModel(emailObj);
		 emailObj.save(function(err, email){
		 if(err) {
		 return reject(error);
		 }
		 return resolve(email);
		 });
		 })
		 }
		 */
	};

	register(null, {
		customMandrillSender : CustomMandrillSender
	})
};
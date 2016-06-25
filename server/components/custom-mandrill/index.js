'use strict';

var config = require('../../config/environment');
var mandrill = require('node-mandrill')(config.mandrill.API_KEY);
var $q = require('q');
var domain = require("domain");
var d1 = domain.create();
var EventEmitter = require('events').EventEmitter;
var console = process.console;
var _ = require("lodash");
var emailLogger = require('winston').loggers.get('emailSending');


d1.on('error', function(err){
	emailLogger.error(err);
	module.exports.status = "ready";

});

module.exports = function(app) {
	var Email = app.Email;//require("../../api/email/email.model")(app);
	var User = app.User;
	var config = app.config;
	//var User = require("../../api/user/user.model")(app);
	var exports = {
		app : app,
		domain : d1,
		emailLogger : require('winston').loggers.get('emailSending'),
		mandrill : require('node-mandrill')(config.mandrill.API_KEY),
		emails : {
			admin : config.email.admin,
			adminTest : config.email.adminTest
		},

		_getAdminEmail : d1.bind(function(){
			if(config.env == "production") {
				return exports.emails.admin;
			}
			return exports.emails.adminTest;
		}),
		// these are loaded in the sub-modules located in this directory
		sendTemplate : {
			sendSimpleTemplate : d1.bind(function(emailAddress, template){
				return new Promise(function(resolve, reject){
					var params = {
						template_name : template,
						template_content :[],
						message : {
							to: [{email : emailAddress}],
							merge_language : "handlebars",
							inline_css : true
						}
					}
					exports._send(params).then(resolve, reject);
				});
			}),
			toUser : {

			},
			toAdmin : {

			},
			toProperty : {

			}
		},
		/**
		 *
		 * @param template
		 * @param response
		 * @param options - object that can contain a "user" for saving, etc - check email model
		 * @private
		 */
		_save : function(response, options) {
			emailLogger.info("customMandrill._save() called with a response from mandrill's api: ", response);
			// mandrill responds with an array of one object, not sure why they do this, maybe they can respond with
			// multiple objects but I've never seen that so far
			var deferred = $q.defer();
			var response = response && response[0] ? response[0] : response;

			// construct the email to be saved
			var emailObj = {
				_mandrillResponse : response,
				mandrill_id : response._id
			};
			emailObj = _.merge(emailObj, options);

			// save the email
			emailObj = new Email(emailObj);
			emailObj.save(function(err, email){
				if(err) {
					deferred.reject(error);
				}
				deferred.resolve(email);
			});

			return deferred.promise;
		},

		_send : function(options) {
			emailLogger.info("customMandrill._send() called, sending template name :'" + options.template_name + "'");
			var deferred = $q.defer();
			mandrill('messages/send-template', options, function(error, response){
				if(error) deferred.reject(error);
				deferred.resolve(response);
			})
			return deferred.promise;
		},

		send : function(sendObject, options) {
			var deferred = $q.defer();
			var self = this;

			mandrill('/messages/send', {
				message: sendObject
			}, function(error, response)
			{
				//uh oh, there was an error
				if (error){
					emailLogger.error(error);
					deferred.resolve(new Error(error));//handleError(res, error);
				}
				//everything's good, lets see what mandrill said
				else {
					emailLogger.verbose("custom-mandrill.send returned successfully, heres the response: '", response, "'");
					self._save(response, options)
					deferred.resolve(response);
					return response;
				}
			});
			return deferred.promise;
		}
	};

	return exports;
}
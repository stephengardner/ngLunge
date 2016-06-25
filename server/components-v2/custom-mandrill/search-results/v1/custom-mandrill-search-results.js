var async = require("async"),
	_ = require("lodash"),
	logger = require("../../../../components/logger")(),
	config = require("../../../../config/environment")
	;
module.exports = function(options, imports, register){
	var templateToProperty = "property-lead-notification-3-0",
		templateToAdmin = "admin-property-lead-notification-3-0",
		customMandrillSender = imports.customMandrillSender,
		loggerType = 'custom-mandrill-search-results',
		adminEmail = "apartminty-admin-testing@googlegroups.com"; // todo reorganize this, put it in config
	// Send the admins the ADMIN ONLY early bird notification
	var customMandrillSearchResultsAdminEarlyBird = {
		send : function(options){
			return new Promise(function(resolve, reject){
				var user = options.user;
				params = {
					user : user,
					email : config.email.admin,
					template_name : 'admin-user-early-bird-notification',
					global_merge_vars : [
						{
							name : "user",
							content: user
						}
					]
				};
				params = customMandrillSender._simpleCreateParams(params);
				customMandrillSender._send(params).then(function(response){
					return resolve(response);
				}).catch(reject);
			})
		}
	};
	// Send users the USERS ONLY early bird notification
	var customMandrillSearchResultsUserEarlyBird = {
		send : function(options){
			return new Promise(function(resolve, reject){
				var user = options.user;
				params = {
					user : user,
					template_name : 'user-results-early-bird-beta',
					global_merge_vars : [
						{
							name : "user",
							content: user
						}
					]
				};
				params = customMandrillSender._simpleCreateParams(params);
				customMandrillSender._send(params).then(function(response){
					return resolve(response);
				}).catch(reject);
			})
		}
	};
	var customMandrillSearchResultsAdminEmpty = {
		send : function(options){
			return new Promise(function(resolve, reject){
				var searchResults = options.searchResults;
				var user = options.user;
				params = {
					user : user,
					email : config.email.admin,
					template_name : 'admin-user-had-no-results-notification',
					global_merge_vars : [
						{
							name : "user",
							content: user
						}
					]
				};
				params = customMandrillSender._simpleCreateParams(params);
				customMandrillSender._send(params).then(function(response){
					return resolve(response);
				}).catch(reject);
			})
		}
	};

	var customMandrillSearchResultsUser = {
		send : function(options){
			return new Promise(function(resolve, reject){
				var matches = options.searchResults;
				var user = options.user;
				params = {
					user : user,
					template_name : 'user-results-delivery-2-0',
					global_merge_vars : [
						{
							name : "results",
							content: matches
						},
						{
							name : "user",
							content: user
						}
					]
				};
				params = customMandrillSender._simpleCreateParams(params);
				customMandrillSender._send(params).then(function(response){
					return resolve(response);
				}).catch(reject);
			})
		}
	};
	var customMandrillSearchResultsAdmin = {
		send : function(options){
			return new Promise(function(resolve, reject){
				var matches = options.searchResults;
				var user = options.user;
				params = {
					user : user,
					email : config.email.admin,
					template_name : 'user-results-delivery-2-0',
					global_merge_vars : [
						{
							name : "results",
							content: matches
						},
						{
							name : "user",
							content: user
						}
					]
				};
				params = customMandrillSender._simpleCreateParams(params);
				customMandrillSender._send(params).then(function(response){
					return resolve(response);
				}).catch(reject);
			})
		}
	};
	register(null, {
		customMandrillSearchResultsAdmin : customMandrillSearchResultsAdmin,
		customMandrillSearchResultsUser : customMandrillSearchResultsUser,
		customMandrillSearchResultsAdminEmpty : customMandrillSearchResultsAdminEmpty,
		customMandrillSearchResultsAdminEarlyBird : customMandrillSearchResultsAdminEarlyBird,
		customMandrillSearchResultsUserEarlyBird : customMandrillSearchResultsUserEarlyBird
	})
};
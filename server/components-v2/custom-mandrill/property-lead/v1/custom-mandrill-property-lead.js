var async = require("async"),
	_ = require("lodash"),
	logger = require("../../../../components/logger")(),
	config = require("../../../../config/environment")
	;
module.exports = function(options, imports, register){
	var templateToProperty = "property-lead-notification-3-0",
		templateToAdmin = "admin-property-lead-notification-3-0",
		propertyLeadModel = imports.propertyLeadModel,
		customMandrillSender = imports.customMandrillSender,
		loggerType = 'custom-mandrill-property-lead',
		adminEmail = "apartminty-admin-testing@googlegroups.com"; // todo reorganize this, put it in config
	var customMandrillPropertyLead = {

		// call send but force to send to the admin email with the admin template
		sendToAdmin : function(lead) {
			var options = {
				toAdmin : true
			};
			return customMandrillPropertyLead.send(lead, options);
		},

		// send the lead by default to the property, but can be called with options to force it to send to the admin
		// it will also send to the admin if the lead is marked as "testing"
		send : function(lead, options) {
			options = options || {};
			return new Promise(function(resolve, reject){
				async.waterfall([
					function populateLead(callback){
						logger.info({type : loggerType, msg : 'about to populate the lead', tags : ['waterfall']});
						// This is Imperative that the propertyLead be populated again.  Otherwise the user filters will not do anything.
						propertyLeadModel.findById(lead._id).populate("property").populate('user').populate("data.filters.apartment_size")
							.exec(function(err, populatedLead){
								if(err) return callback(err);
								return callback(null, populatedLead);
							})
					},
					function setParams(populatedLead, callback){
						logger.info({type : loggerType,
							msg : 'about to create the mandrill simpleParams', tags : ['waterfall']});
						var params, email, template;
						try {
							if(options.toAdmin) {
								if(populatedLead.testing) {
									email = config.email.adminTesting;
								}
								else {
									email = config.email.admin;
								}
								template = templateToAdmin;
							}
							else {
								if(!populatedLead.property.final.lead_tracker_email) {
									reject(new Error('The property does not have a lead_tracker_email associated' +
									' with it and therefore cannot receive this lead!'));
								}
								email = populatedLead.property.final.lead_tracker_email;
								template = templateToProperty;
							}
							params = {
								template_name : template,
								email : email,
								global_merge_vars : [
									{
										name : "lead",
										content: populatedLead
									}
								]
							};
							params = customMandrillSender._simpleCreateParams(params);
						}
						catch(err) {
							return callback(err);
						}
						return callback(null, params);
					},
					function sendLead(params, callback) {
						logger.info({type : loggerType,
							msg : 'about to pass the params off to customMandrillSender', tags : ['waterfall']});
						if(config.env != "production" && !options.toAdmin) {
							reject(new Error("We're not in production and this email is going to be sent to " +
							"an actual property, are you sure you want this?"));
						}
						customMandrillSender._send(params).then(function(response){
							return callback(null, response);
						}).catch(callback);
					}
				], function(err, response){
					if(err) return reject(err);
					return resolve(response);
				})
			})
		}
	};
	register(null, {
		customMandrillPropertyLead : customMandrillPropertyLead
	})
};
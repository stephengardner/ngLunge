var nodemailer = require('nodemailer');
var logger = require("../logger")();
module.exports = function(app) {
	var CustomMandrill = require("../custom-mandrill")(app);
	var config = app.config;
	var Registrar = {
		sendRegistrationEmail : function(trainerModel) {
			return new Promise(function(resolve, reject){
				logger.info("SendingRegistrationEmail...");
				var params = {
					template_name : 'trainer-registration-v1',
					template_content :[],
					message : {
						to : [{email : config.email.admin}],
						merge_language : 'handlebars',
						inline_css : true,
						global_merge_vars : [
							{
								name : 'domain',
								content : config.DOMAIN
							},
							{
								name : 'authenticationHash',
								content : trainerModel.registration.authenticationHash
							}
						]
					}
				};
				CustomMandrill._send(params).then(resolve, reject).catch(reject);
			})
		}
	}
	return Registrar;
}
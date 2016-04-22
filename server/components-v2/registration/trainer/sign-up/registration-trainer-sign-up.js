module.exports = function setup(options, imports, register) {
	var logger = imports.logger.info,
		customMandrill = imports.customMandrillSender,
		config = require('../../../../config/environment')
	;
	var Registrar = {
		sendEmail : function(trainerModel) {
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
				customMandrill._send(params).then(resolve, reject).catch(reject);
			})
		}
	};

	register(null, {
		registrationTrainerSignUp : Registrar
	});
}
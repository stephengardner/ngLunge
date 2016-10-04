var config = require('../../../../config/environment'),
	sendgrid = require("sendgrid").SendGrid(config.sendgrid.clientSecret)
	;
module.exports = function setup(options, imports, register) {
	var logger = imports.logger.info,
		customMandrill = imports.customMandrillSender,
		config = require('../../../../config/environment'),
		sendgridEmailSender = imports.sendgridEmailSender
		;
	var registrationTrainerSignUp = {
		sendEmail : function(trainerModel) {
			return new Promise(function(resolve, reject){
				logger.info("SendingRegistrationEmail...");
				sendgridEmailSender.send({
					"personalizations": [
						{
							"to": [
								{
									"email": trainerModel.email
								}
							],
							"substitutions" : {
								"-domain-" : config.DOMAIN,
								"-href-" : 'verify-email' +
								'/trainer/'	+
								trainerModel.registration.authenticationHash
							}
						}
					],
					"template_id": "5ea8d8e5-5c16-4534-bfe1-b25959df3b69"
				}).then(resolve).catch(reject);
			})
		}
	};

	register(null, {
		registrationTrainerSignUp : registrationTrainerSignUp
	});
}
var config = require('../../../config/environment'),
	sendgrid = require("sendgrid").SendGrid(config.sendgrid.clientSecret),
	async = require('async')
	;
module.exports = function setup(options, imports, register) {
	var logger = imports.logger.info,
		trainerPopulator = imports.trainerPopulator,
		sendgridEmailSender = imports.sendgridEmailSender
		;
	var passwordResetSender = {
		send : function(trainerModel) {
			return new Promise(function(resolve, reject){
				var populatedTrainer
				;
				async.waterfall([
					function populate(callback) {
						trainerPopulator.populate(trainerModel).then(function(response){
							populatedTrainer = response;
							callback();
						}).catch(callback)
					},
					function send(callback) {
						sendgridEmailSender.send({
							"personalizations": [
								{
									"to": [
										{
											"email": "opensourceaugie@gmail.com"
										}
									],
									"substitutions" : {
										"-domain-" : config.DOMAIN,
										"-href-" : "password-reset"
										+ "/trainer"
										+ "/confirm/"
										+ trainerModel.password_reset.authenticationHash
									}
								}
							],
							"template_id": "ca5d0940-11f8-4ab8-8140-b9a932850b4a"
						}).then(callback(null)).catch(callback);
					}
				], function(err, response){
					if(err) return reject(err);
					return resolve(response);
				})
			})
		}
	};

	register(null, {
		passwordResetSender : passwordResetSender
	});
}
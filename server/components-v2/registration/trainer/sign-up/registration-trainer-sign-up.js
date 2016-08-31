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
				// var email = new sendgrid.Email();
				//
				// var link = config.DOMAIN
				// 		+'/verify-email'
				// 		+'/trainer/'
				// 		+ trainerModel.registration.authenticationHash
				// 	;
				// email.addTo(trainerModel.email);
				// email.setFrom("registration@golunge.com");
				// email.setSubject("Welcome to Lunge!  Verify your Email");
				// email.setHtml("To complete your registration, please click the following link: " +
				// 	"<a href='" + link + "'>" + link + "</a>");

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
								"-href-" : 'verify-email' +
								'/trainer/'	+
								trainerModel.registration.authenticationHash
							}
						}
					],
					"template_id": "aa29ec6d-89e5-4b42-80b9-929b841397a4"
				}).then(resolve).catch(reject);
				// sendgrid.send(email, function(err, response){
				// 	if(err){
				// 		console.log(err);
				// 		return reject(err)
				// 	}
				// 	return resolve(response);
				// });
				// var params = {
				// 	template_name : 'trainer-registration-v1',
				// 	template_content :[],
				// 	message : {
				// 		to : [{email : config.email.admin}],
				// 		merge_language : 'handlebars',
				// 		inline_css : true,
				// 		global_merge_vars : [
				// 			{
				// 				name : 'domain',
				// 				content : config.DOMAIN
				// 			},
				// 			{
				// 				name : 'authenticationHash',
				// 				content : trainerModel.registration.authenticationHash
				// 			}
				// 		]
				// 	}
				// };
				// customMandrill._send(params).then(resolve, reject).catch(reject);
			})
		}
	};

	register(null, {
		registrationTrainerSignUp : registrationTrainerSignUp
	});
}
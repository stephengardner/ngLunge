var Promise = require("promise");
var nodemailer = require('nodemailer');
module.exports = function(app) {
	var config = app.config;
	 var Registrar = {
		 sendRegistrationEmail : function(trainerModel) {
			 return new Promise(function(resolve, reject){
				 var transporter = nodemailer.createTransport({
					 service: 'gmail',
					 auth: {
						 user: config.MAIL.user,
						 pass: config.MAIL.pass
					 }
				 });
				 transporter.sendMail({
					 from: 'augdog911@gmail.com',
					 to: trainerModel.email,
					 subject: 'Lunge Automatic Email Validation',
					 text: 'Thanks for registering with Lunge.  To activate your account please click on this link:' + config.DOMAIN + '/trainer/register/password/' + trainerModel.registration.authenticationHash
				 }, function(err, response) {
					 if(err) return reject(err);
					 return resolve(response);
				 });
			 })
		 }
	 }
	return Registrar;
}
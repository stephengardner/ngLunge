
var config = require('../../../config/environment'),
	sendgrid = require("sendgrid").SendGrid(config.sendgrid.clientSecret),
	_ = require('lodash')
	;
module.exports = function setup(options, imports, register) {
	var sendgridEmailSender = {
		send : function(data) {
			return new Promise(function(resolve, reject){
				var request = sendgrid.emptyRequest(),
					DEFAULTS = {
						"from": {
							"email": "messages@golunge.com"
						},
						"content" : [
							{
								"type" : "text/html",
								"value" : "."
							}
						]
					}
					;
				request.method = 'POST';
				request.path = '/v3/mail/send';
				request.body = _.defaultsDeep(data, DEFAULTS);

				sendgrid.API(request, function (response) {
					// console.log('resposne:', response);
					if(response.statusCode != "202" && response.statusCode != "200") {
						console.log("Rejecting because status code was: ", response.statusCode);
						return reject(response);
					}
					console.log("Successfully sent message.  Response is:", response);
					console.log("Request body sending was:", request.body);
					return resolve(response);
				});
			})
		}
	};
	register(null, {
		sendgridEmailSender : sendgridEmailSender
	});
};
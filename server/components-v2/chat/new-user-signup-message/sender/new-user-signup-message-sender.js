var async = require('async')
;
module.exports = function setup(options, imports, register) {
	var userModel = imports.userModel,
		chatSender = imports.chatSender
	;
	var newUserSignupMessageSender = {
		send : function(user) {
			var adminUser,
				messageToTrainer = 'Welcome to Lunge!  My name is Stephen and I\'m here to help with any' +
					' questions you might have.  Feel free to send me a message, or click the Help icon in the main ' +
					'menu.' +
					'  Happy Lunging!'
			;
			return new Promise(function(resolve, reject) {
				async.waterfall([
					function getAdmin(callback) {
						console.log("Attempting to get admin");
						userModel.findOne({
							kind : 'trainer',
							email : 'augdog911@gmail.com'
						}, function(err, response){
							if(err) return callback(err);
							if(!response){
								return resolve();
								return callback(new Error('NO AUGIE EXISTS YET'));
							}
							adminUser = response;
							console.log("Using admin user: " + adminUser.email + " to send a message to " + user.email);
							return callback();
						})
					},
					function sendMessage(callback) {
						chatSender.send(adminUser, user, messageToTrainer).then(function(response){
							callback();
						}).catch(callback);
					}
				], function(err){
					if(err) return reject(err);
					return resolve();
				});
			})
		}
	};
	register(null, {
		newUserSignupMessageSender : newUserSignupMessageSender
	})
};
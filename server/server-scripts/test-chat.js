var _ = require("lodash");
var architect = require("architect");
var config = require("../config/environment");
var appConfig = require('../app_v2/architect/main-app')(config);
// var tree = architect.resolveConfig(appConfig, __dirname);

architect.createApp(appConfig, function(err, Architect){
	var logger = Architect.getService("logger").info;
	var certificationOrganizationModel = Architect.getService('certificationOrganizationModel');
	var userModel = Architect.getService('userModel');
	var chatSender = Architect.getService('chatSender');
	var chatModel = Architect.getService('chatModel'),
		chatNotificationReader = Architect.getService('chatNotificationReader')
	var user1, user2;

	userModel.findOne({'id' : 28}).exec(function(err, found){
		// console.log("FOUMND1:", found);
		user1 = found;
		userModel.findOne({'id' : 20}).exec(function(err, found){
			// console.log("FOUMND:", found);
			user2 = found;
			chatSender.send(user2, user1, 'cool i got your new message...').then(function(response){
				console.log("done");
				chatModel.aggregate([
					{
						$match : {
							'participants.user' : user2._id
						}
					},
					{
						$project: {
							'last_message' : {
								$slice : ['$messages', -1]
							},
							'last_message_text' : {
								$slice : ['$messages.message', -1]
							},
							'last_message_sender' : {
								$slice : ['$messages.sender', -1]
							},
							'last_message_sent_at' : '$last_message_sent_at',
							'chat_type' : '$chat_type',
							'is_group_message' : '$is_group_message'
						}
					}
				], function(err, response){
					userModel.populate(response,
						{'path' : 'last_message_sender', 'select' : '_id name profile_picture'},
						function(err, populated){
							populated.forEach(function(item, index, arr) {
								item.last_message = item.last_message && item.last_message.length
									? item.last_message[0] : '';
								item.last_message_text = item.last_message_text && item.last_message_text.length
									? item.last_message_text[0] : '';
								item.last_message_sender = item.last_message_sender && item.last_message_sender.length
									? item.last_message_sender[0] : undefined;
								if(item.last_message_sender) {
									item.last_message_sender = {
										name : item.last_message_sender.name,
										profile_picture : item.last_message_sender.profile_picture
									};
								}
								console.log("item", item);
								arr[index] = item;
							});
							console.log("populated", populated);
						})
				});
			}).catch(logger.error);

		});


	});
	// chatModel.aggregate([
	// 	{
	// 		$match : {'participants.user' : populatedUser._id}
	// 	},
	// 	{
	//
	// 	}
	// ])
	/*
	 certificationOrganizationModel.find({}).populate('certifications').exec(function(err, certs){
	 for(var i = 0; i < certs.length; i++) {
	 removeEmptyCertTypes(certs[i]);
	 certs[i].save(function(err, saved){

	 });
	 }
	 });
	 function removeEmptyCertTypes(cert){
	 for(var i = 0; i < cert.certifications.length; i++) {
	 var certification = cert.certifications[i];
	 //console.log("Cert is:", certification);
	 if(!certification.name) {
	 console.log("CERT IS:", certification);
	 cert.certifications.splice(i, 1);
	 i--
	 }
	 }
	 }
	 */
	//certificationOrganizationModel.findOne({'id' : 60}).populate('certifications').exec(function(err, cert){
	//	if(err) logger.error(err);
	//
	//	cert.save(function(err, saved){
	//
	//		console.log(saved);
	//	})
	//});
	//emailSearchResultsModel.findOne({}, function(err, emailSearchResults){
	//	emailSearchResultsSearchProcessor.process(emailSearchResults).then(function(response){
	//		emailSearchResultsEmailCreator.createEmailToAdmin(emailSearchResults, response.type).then(function(response){
	//			console.log("DONE?");
	//		}).catch(logger.error);
	//	}).catch(logger.error);
	//});

});
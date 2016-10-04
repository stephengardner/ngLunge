var _ = require("lodash");
var architect = require("architect");
var config = require("../config/environment");
var appConfig = require('../app_v2/architect/main-app')(config),
	mongoose = require('mongoose')
	;
// var tree = architect.resolveConfig(appConfig, __dirname);

architect.createApp(appConfig, function(err, Architect){

	var logger = Architect.getService("logger").info;
	var certificationOrganizationModel = Architect.getService('certificationOrganizationModel');
	var trainerModel = Architect.getService('trainerModel');
	var certificationMapCreator = Architect.getService('certificationMapCreator'),
		chatModel = Architect.getService('chatModel')
		;

	chatModel.aggregate([
		{
			$match : {
				'_id' : mongoose.Types.ObjectId('57c67daac05f631c05ef2b2d'),
				'messages' : {
					$elemMatch : {
						'_id' : mongoose.Types.ObjectId('57c684c0721700f0238e64b7')
					}
				}
			}
		},
		{
			$unwind : '$messages'
		},
		{
			$match : {
				'messages._id' : mongoose.Types.ObjectId('57c684c0721700f0238e64b7')
			}
		},
		{
			$project : {
				'_id' : false,
				'message' : '$messages'
			}
		}
	], function(err, found){
		console.log(found);

		if(found && found[0] && found[0].message) {
			var message = found[0].message;
			message.meta.forEach(function(metaItem, metaIndex, metaArr) {
				if(metaItem.user == '57c5eb73ddbb540006a2a883') {
					metaItem.read = false;
				}
				metaArr[metaIndex] = metaItem;
			});
			chatModel.update({
					'messages._id' : mongoose.Types.ObjectId('57c684c0721700f0238e64b7')
				},
				{
					$set : {
						'messages.$': message
					}
				}, function(err, res){
					console.log(res);
				})
		}

	})

});
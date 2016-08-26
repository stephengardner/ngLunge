'use strict';

var _ = require('lodash');
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment'),
	crypto = require('crypto'),
	validator = require("validator")
	;


var options = {
	discriminatorKey : 'kind',
	toObject: { virtuals: true },
	toJSON: { virtuals: true }
};
var TraineeSchema = new Schema(
	{
		// location: {
		// 	title : { type : String, default : "Main Location", required : false },
		// 	google : {
		// 		placesAPI : {
		// 			formatted_address : { type : String }
		// 		}
		// 	},
		// 	primary : { type : Boolean, default : true },
		// 	address_line_1 : {type : String, required : false},
		// 	address_line_2 : {type : String, required : false},
		// 	city : {type : String, required : false},
		// 	state : {type : String, required : false},
		// 	zipcode : {type : String, required : false},
		// 	coords : {
		// 		type : Object,
		// 		lat : { type : Number },
		// 		lon : { type : Number }
		// 	},
		// 	smarty_streets_response : {}
		// }
	},
	options);

module.exports = function setup(options, imports, register) {
	var userModel = imports.userModel;
	var connectionDatabase = imports.connectionDatabase;
	var Model = userModel.discriminator('trainee', TraineeSchema);
	// var Model = connectionDatabase.model('Trainee', TraineeSchema);

	// TraineeSchema.plugin(autoIncrement.plugin, { model: 'Trainee', field: 'id' });
	register(null, {
		traineeModel : Model
	});
};
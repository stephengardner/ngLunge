'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');

var TrainerSchema = new Schema({
	id : { type : Number },
	name : { first : {type : String, required : false}, last : {type : String, required : false} },
	location: { city : {type : String, required : false}, state : {type : String, required : false}, zip : {type : Number, required : false} },
	active: {type : Boolean, default : 1},
	rating : {type : Number, default : 0},
	profile_picture : {url : {type : String}},
	type : String
});


module.exports = mongoose.model('Trainer', TrainerSchema);
TrainerSchema.plugin(autoIncrement.plugin, { model: 'Trainer', field: 'id' });
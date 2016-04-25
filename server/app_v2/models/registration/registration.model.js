'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');
var crypto = require('crypto');


var RegistrationSchema = new Schema(
	{
		id : { type : Number },
		verified : Boolean,
		authenticationHash : String,
		email : String,
		active : Boolean,
		authenticated : Boolean
	},
	{
		toObject: { virtuals: true },
		toJSON: { virtuals: true }
	}
);

module.exports = function setup(options, imports, register) {
	var connectionDatabase = imports.connectionDatabase;
	RegistrationSchema.plugin(autoIncrement.plugin, { model: 'Registration', field: 'id' });
	var Model = connectionDatabase.model('Registration', RegistrationSchema);

	register(null, {
		registrationModel : Model
	})
}
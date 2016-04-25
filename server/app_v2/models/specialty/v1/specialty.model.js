'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');


var SpecialtySchema = new Schema(
	{
		id : { type : Number },
		name : { type : String, unique : true },
		created_at : Date,
		updated_at : Date,
		description : String
	},
	{
		toObject: { virtuals: true },
		toJSON: { virtuals: true }
	}
);


module.exports = function setup(options, imports, register) {
	SpecialtySchema.plugin(autoIncrement.plugin, { model: 'Specialty', field: 'id' });
	var connectionDatabase = imports.connectionDatabase;
	var Model = connectionDatabase.model('Specialty', SpecialtySchema);
	register(null, {
		specialtyModel : Model
	})
}
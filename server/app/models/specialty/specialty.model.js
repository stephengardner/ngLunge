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

SpecialtySchema.plugin(autoIncrement.plugin, { model: 'Specialty', field: 'id' });

module.exports = function(app) {
	var Model = app.connections.db.model('Specialty', SpecialtySchema);
	return Model;
}
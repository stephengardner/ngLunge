'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');


var ActivitySchema = new Schema(
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

ActivitySchema.plugin(autoIncrement.plugin, { model: 'Activity', field: 'id' });

module.exports = function(app) {
	var Model = app.connections.db.model('Activity', ActivitySchema);
	return Model;
}
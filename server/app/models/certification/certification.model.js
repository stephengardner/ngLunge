'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');
var crypto = require('crypto');


var CertificationSchema = new Schema(
	{
		id : { type : Number },
		name : { type : String },
		types : [{ type : Schema.Types.ObjectId, ref : 'CertificationType' }],
		about : { type : String },
		address : { type : String },
		phone : { type : String },
		website : { type : String },
		active: {type : Boolean, default : 1}
	},
	{
		toObject: { virtuals: true },
		toJSON: { virtuals: true }
	}
);
CertificationSchema.plugin(autoIncrement.plugin, { model: 'Certification', field: 'id' });

module.exports = function(app) {
	var Model = app.connections.db.model('Certification', CertificationSchema);
	return Model;
}
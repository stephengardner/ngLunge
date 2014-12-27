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
/*
// Validate email is not taken
CertificationSchema
	.path('email')
	.validate(function(value, respond) {
		var self = this;
		this.constructor.findOne({email: value}, function(err, trainer) {
			if(err) throw err;
			if(trainer) {
				if(self.id === trainer.id) return respond(true);
				return respond(false);
			}
			respond(true);
		});
	}, 'The specified email address is already in use.');
*/

module.exports = mongoose.model('Certification', CertificationSchema);
CertificationSchema.plugin(autoIncrement.plugin, { model: 'Certification', field: 'id' });
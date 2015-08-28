'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');
var crypto = require('crypto');


var CertificationTypeSchema = new Schema(
	{
		id : { type : Number },
		certification : {type : Schema.Types.ObjectId, ref : 'Certification'},
		name : { type : String },
		about : { type : String },
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

module.exports = mongoose.model('CertificationType', CertificationTypeSchema);
CertificationTypeSchema.plugin(autoIncrement.plugin, { model: 'CertificationType', field: 'id' });

module.exports = function(app) {
	var Model = app.connections.db.model('CertificationType', CertificationTypeSchema);
	return Model;
}
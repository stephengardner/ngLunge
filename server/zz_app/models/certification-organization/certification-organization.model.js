'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment'),
	slug = require('slug');
var crypto = require('crypto');


var CertificationOrganizationSchema = new Schema(
	{
		id : { type : Number },
		name : { type : String },
		// types deprecated
		//types : [{ type : Schema.Types.ObjectId, ref : 'CertificationType' }],
		certifications : [{ type : Schema.Types.ObjectId, ref : 'CertificationType' }],
		about : { type : String },
		address : { type : String },
		phone : { type : String },
		website : { type : String },
		active: {type : Boolean, default : 1},
		slug : String
	},
	{
		toObject: { virtuals: true },
		toJSON: { virtuals: true }
	}
);
CertificationOrganizationSchema.plugin(autoIncrement.plugin, { model: 'CertificationOrganization', field: 'id' });

CertificationOrganizationSchema
.pre('save', function(next){
		if(this.name) {
			this.slug = slug(this.name, {lower: true});
		}
		next();
	});

// Pre validation can use 'this' for referencing the whole document.
// Since .path validation requires it be defined in the first place.
CertificationOrganizationSchema
	.pre('validate', function (next){
		if(!this.name){
			this.invalidate('name', 'A name is required');
		}
		next();
});

CertificationOrganizationSchema
	.path('name')
	.validate(function(name, respond){
		var self = this;
		console.log("Validating name:", name);
		var regex = new RegExp(["^", name, "$"].join(""), "i");
		this.constructor.findOne({name: regex}, function(err, cert) {
			console.log("CERT:",cert);
			if(err) throw err;
			if(cert) {
				if(self.id === cert.id) return respond(true);
				return respond(false);
			}
			return respond(true);
		});
	}, 'There is already a certification with that name');

module.exports = function(app) {
	var Model = app.connections.db.model('CertificationOrganization', CertificationOrganizationSchema);
	return Model;
}
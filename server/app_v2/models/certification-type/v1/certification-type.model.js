'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');
var crypto = require('crypto');


var CertificationTypeSchema = new Schema(
	{
		id : { type : Number },
		// deprecated
		//certification : {type : Schema.Types.ObjectId, ref : 'Certification'},
		// organization should be the new usage
		organization : {type : Schema.Types.ObjectId, ref : 'CertificationOrganization'},
		description : String,
		name : { type : String },
		about : { type : String },
		active: {type : Boolean, default : 1},
		accreditation : String,
		courseMaterialPrice : Number,
		examPrice : Number,
		examDeliveryMethod : String,
		practicalExamRequired : Boolean,
		prerequisite : String,
		renewalPeriod : String,
		CECorCEUperRenewalPeriod : Number,
		renewalFee : Number,
		continuingEducationTerm : String,
		oneHourContinuingEducationEquals : Number,
		category : [String]

	},
	{
		toObject: { virtuals: true },
		toJSON: { virtuals: true }
	}
);

Array.prototype.remove = function() {
	var what, a = arguments, L = a.length, ax;
	while (L && this.length) {
		what = a[--L];
		while ((ax = this.indexOf(what)) !== -1) {
			this.splice(ax, 1);
		}
	}
	return this;
};

Array.prototype.pushUnique = function (item){
	if(this.indexOf(item) == -1) {
		//if(jQuery.inArray(item, this) == -1) {
		this.push(item);
		return true;
	}
	return false;
}

module.exports = function setup(options, imports, register) {
	var connectionDatabase = imports.connectionDatabase;
	var trainerModel = imports.trainerModel;
	CertificationTypeSchema.plugin(autoIncrement.plugin, { model: 'CertificationType', field: 'id' });
	var Model = connectionDatabase.model('CertificationType', CertificationTypeSchema);
	var certificationOrganizationModel = imports.certificationOrganizationModel;

	CertificationTypeSchema.post('save', function(certType){
		console.log("Saved cert type with cert organization:", certType.organization);
		certificationOrganizationModel.findById(certType.organization, function(err, foundOrganization){
			if(err) {

			}
			if(!foundOrganization) {

			}
			else {
				foundOrganization.certifications.pushUnique(certType._id);
				foundOrganization.markModified('certifications');
				foundOrganization.save(function(err, savedOrganization){
					console.log("Saved organization as now:", savedOrganization);
				})
			}
		})
	});
	CertificationTypeSchema.post('remove', function(certType){
		// Remove the certification from the trainers list of certifications
		trainerModel.find({'certifications_v2.certification_type' : certType._id.toString()}).exec(function(err, trainers){
			if(err) {
			}
			if(!trainers) {
			}
			else {
				for(var i = 0; i < trainers.length; i++) {
					var trainer = trainers[i];
					for(var k = 0; k < trainer.certifications_v2.length; k++) {
						var certification_v2 = trainer.certifications_v2[k];
						// todo make sure this is accurate.
						if(certification_v2.certification_type == certType._id) {
							trainer.certifications_v2.splice(k, 1);
							k--;
						}
					}
					//trainer.certifications_v2.remove(certType._id);
					trainer.markModified('certifications_v2');
					trainer.save();
				}
			}
		});
		// Remove the certification from the organizations list of certifications
		certificationOrganizationModel.findById(certType.organization, function(err, foundOrganization){
			if(err) {
			}
			if(!foundOrganization) {
			}
			else {
				var certifications = foundOrganization.certifications, found = false;
				foundOrganization.certifications.remove(certType._id);
				foundOrganization.markModified('certifications');
				foundOrganization.save(function(err, savedOrganization){
					console.log("Saved organization as now:", savedOrganization);
				})
			}
		});
	});

	register(null, {
		certificationTypeModel : Model
	})
};
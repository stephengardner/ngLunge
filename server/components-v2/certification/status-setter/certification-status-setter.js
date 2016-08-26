'use strict';

var async = require('async'),
	ObjectId = require('mongoose').Types.ObjectId;
;
module.exports = function setup(options, imports, register) {
	var certificationPopulator = imports.certificationPopulator,
		trainerModel = imports.trainerModel
	;
	var certificationStatusSetter = {
		// Not using this.  Not finished
		setAlpha : function(certificationV2) {
			return new Promise(function(resolve, reject){
				var approved, pending, rejected,
					populatedCertification
					;
				async.waterfall([
					function populate(callback) {
						certificationPopulator.populate(certificationV2).then(function(response){
							populatedCertification = response;
							callback();
						}).catch(callback);
					},
					function findTrainerThisBelongsTo(callback) {
						trainerModel.findOne({'certifications_v2._id' : ObjectId(populatedCertification._id)}).exec(function(err, found){
							if(err) return callback(err);
							if(!found) {
								return callback(new Error('no trainer found'));
							}
							callback();
						})
					},
					// Works up until here. If we want to implement this, we'll edit the trainer and save the
					// trainer.  I didn't go this route because setSimlpe works fine when we already ahve the cert
					function set(callback) {
						return callback();
						if(populatedCertification.verification) {
							for(let file of populatedCertification.verification.files) {
								if(file.status == 'Approved') {
									approved = true;
								}
								if(file.status == 'Pending') {
									pending = true;
								}
								if(file.status == 'Rejected') {
									rejected = true;
								}
							}
						}
						else {
							return;
						}
						if(approved) {
							certificationV2.verification.status = 'Approved';
						}
						if(pending) {
							certificationV2.verification.status = 'Pending';
						}
						if(rejected) {
							certificationV2.verification.status = 'Rejected';
						}
						return certificationV2;
					}
				], function(err, response){
					if(err) return reject(err);
					return resolve();
				})

			})

		},
		// setSimple - works...
		set : function(certificationV2) {
			var approved, pending, rejected;
			if(certificationV2.verification) {
				for(let file of certificationV2.verification.files) {
					if(!file.active) {
						continue;
					}
					if(file.status == 'Approved') {
						approved = true;
					}
					if(file.status == 'Pending') {
						pending = true;
					}
					if(file.status == 'Rejected') {
						rejected = true;
					}
				}
			}
			else {
				return;
			}
			if(approved) {
				certificationV2.verification.status = 'Approved';
			}
			else if(pending) {
				certificationV2.verification.status = 'Pending';
			}
			else if(rejected) {
				certificationV2.verification.status = 'Rejected';
			}
			else {
				certificationV2.verification.status = 'Unverified';
			}
		}
	};
	register(null, {
		certificationStatusSetter : certificationStatusSetter
	})
};
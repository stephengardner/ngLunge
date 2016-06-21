var Promise = require('promise'),
	async = require('async'),
	mongoose = require('mongoose')
;
module.exports = function setup(options, imports, register) {
	var Trainer = imports.trainerModel;
	var certificationOrganizationModel = imports.certificationOrganizationModel,
		certificationMapCreator = imports.certificationMapCreator
	;
	var trainerPopulatorCertificationsAggregated = {
		get: function (trainerOrId) {
			return new Promise(function (resolve, reject) {
				var aggregated;
				if(!trainerOrId) {
					console.warn('Not sure why, but we asked for certificationsAggregated and didn\'t pass in ' +
						'a trainer or id object at all');
					return resolve([]);
				}
				var _id = trainerOrId._id ? trainerOrId._id : mongoose.Types.ObjectId(trainerOrId);
				async.waterfall([
					function getAggregated(callback) {
						Trainer.aggregate([
							{
								"$match": {"_id": _id}
							},
							{
								$redact: {
									$cond: {
										if: {
											$and: [
												{
													$eq: ["$active", false]
												},
												{
													$ifNull: ['$originalname', false]
												}
											]
										},
										then: "$$PRUNE",
										else: "$$DESCEND"
									}
								}
							}
						], function (err, aggregatedResponse) {
							if (err) return callback(err);
							if(!aggregatedResponse) {
								return callback(new Error('No Trainer found using that objectOrID'));
							}
							if(!aggregatedResponse[0])
								aggregated = [];
							else aggregated = aggregatedResponse[0];
							callback(null);
						});
					},
					function getTrainer(callback) {
						Trainer.findById(trainerOrId).exec(function (err, trainer) {
							if (err) return callback(err);
							if(!trainer) {
								return callback(new Error('No Trainer found using that objectOrID'));
							}
							callback(null, trainer);
						})
					},
					function populateTrainer(trainer, callback) {
						// console.log("Trainer i s:", trainer);
						trainer.certifications_v2 = aggregated.certifications_v2;
						trainer
							.populate('certifications_v2.certification_type specialties',
							function (err, unusedPopulatedTrainerOne) {
								if (err) return next(err);
								certificationOrganizationModel
									.populate(trainer,
									{
										path: 'certifications_v2.certification_type.organization',
										model: 'CertificationOrganization'
									},
									function (err, unusedPopulatedTrainerTwo) {
										if (err) return next(err);
										callback(null, trainer);
									})
							})
					},
					function createCertificationMap(trainer, callback) {
						var map = certificationMapCreator.createWithoutPopulating(trainer);
						trainer.certifications_v2_map = map;
						callback(null, trainer);
					}
				], function (err, response) {
					if (err) return reject(err);
					return resolve(response);
				})
			})
		}
	}

	register(null, {
		trainerPopulatorCertificationsAggregated : trainerPopulatorCertificationsAggregated
	})
}
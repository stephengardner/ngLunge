module.exports = function setup(options, imports, register){
	// Unfortunately we kind of structured the models improperly, they need an "app" to run...
	// This could have been better accomplished by using DI from the beginning and passing around the connections
	// object... But alas, we use a mock app with a config in it and get the models this way.
	var MockApp = {
		connections : imports.connections,
		config : options.config // this must be here because some models require config for grabbing Auth data...
	}
	register(null, {
		models : {
			Trainer : imports.trainerModel
			//Registration : require("../../../app/models/registration/registration.model")(MockApp),
			//Certification : require("../../../app/models/certification/certification.model")(MockApp),
			//CertificationType : require("../../../app/models/certification-type/certification-type.model")(MockApp),
			//Activity : require("../../../app/models/activity/activity.model")(MockApp),
			//Specialty : require("../../../app/models/specialty/specialty.model")(MockApp),
			//CertificationOrganization :	require("../../../app/models/certification-organization/certification-organization.model")(MockApp)
		}
	})
}
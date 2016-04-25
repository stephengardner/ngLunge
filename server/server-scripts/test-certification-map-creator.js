var _ = require("lodash");
var architect = require("architect");
var config = require("../config/environment");
var appConfig = [
	// DatabaseConnection
	"../plugins/connector/v1",
	{
		packagePath : '../plugins/connections/v1/database',
		config : config
	},
	"../app_v2/models/trainer/v1",
	"../app_v2/models/certification-organization/v1",
	"../app_v2/models/certification-type/v1",
	"../app_v2/models/specialty/v1",
	"../components-v2/logger",
	"../components-v2/certification-map-creator"
]
var tree = architect.resolveConfig(appConfig, __dirname);

architect.createApp(tree, function(err, Architect){
	var logger = Architect.getService("logger").info;
	var certificationOrganizationModel = Architect.getService('certificationOrganizationModel');
	var trainerModel = Architect.getService('trainerModel');
	var certificationMapCreator = Architect.getService('certificationMapCreator');

	trainerModel.findOne({'id' : 93}).exec(function(err, trainer){
		certificationMapCreator.create(trainer).then(function(response){
			console.log(response);
		}).catch(logger.error);
	})
	/*
	 certificationOrganizationModel.find({}).populate('certifications').exec(function(err, certs){
	 for(var i = 0; i < certs.length; i++) {
	 removeEmptyCertTypes(certs[i]);
	 certs[i].save(function(err, saved){

	 });
	 }
	 });
	 function removeEmptyCertTypes(cert){
	 for(var i = 0; i < cert.certifications.length; i++) {
	 var certification = cert.certifications[i];
	 //console.log("Cert is:", certification);
	 if(!certification.name) {
	 console.log("CERT IS:", certification);
	 cert.certifications.splice(i, 1);
	 i--
	 }
	 }
	 }
	 */
	//certificationOrganizationModel.findOne({'id' : 60}).populate('certifications').exec(function(err, cert){
	//	if(err) logger.error(err);
	//
	//	cert.save(function(err, saved){
	//
	//		console.log(saved);
	//	})
	//});
	//emailSearchResultsModel.findOne({}, function(err, emailSearchResults){
	//	emailSearchResultsSearchProcessor.process(emailSearchResults).then(function(response){
	//		emailSearchResultsEmailCreator.createEmailToAdmin(emailSearchResults, response.type).then(function(response){
	//			console.log("DONE?");
	//		}).catch(logger.error);
	//	}).catch(logger.error);
	//});

});
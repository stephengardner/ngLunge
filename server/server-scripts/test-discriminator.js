var _ = require("lodash");
var architect = require("architect");
var config = require("../config/environment");
var appConfig = require('../app_v2/architect/main-app')(config);
// var tree = architect.resolveConfig(appConfig, __dirname);

architect.createApp(appConfig, function(err, Architect){
	var logger = Architect.getService("logger").info;
	var certificationOrganizationModel = Architect.getService('certificationOrganizationModel');
	var userModel = Architect.getService('userModel');
	userModel.find({}).exec(function(err, found){
		console.log("Got:", found);
	});
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
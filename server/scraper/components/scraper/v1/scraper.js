var async = require("async");
var logger = require("../../../../components/logger")();
var osmosis = require("osmosis");
var Promise = require("promise");
var Xray = require('x-ray');
var x = Xray();

module.exports = function setup(options, imports, register) {
	var certificationOrganizationModel = imports.certificationOrganizationModel;
	var certificationTypeModel = imports.certificationTypeModel;

	var Scrape = {
		run: function () {
			return new Promise(function (resolve, reject) {
				osmosis
					.get('http://www.ideafit.com/certifications', {page: 0})
					.paginate({page: +1}, 4)
					.find('.fc-search-result h2')
					.set({
						title: 'a',
						url: 'a@href'
					})
					.data(function (cert) {
						console.log("Cert:", cert);
						resolve(cert);
					})
					.error(function (err) {
						console.log("Err:", err);
						reject(err);
					})
			})
		},
		processAllOrganizations : function(startingUrl){
			return new Promise(function (resolve, reject) {
				console.log("Scraper processAllOrganizations() starting from url: ", startingUrl);
				x.throttle(1, 1000);
				x(startingUrl, {
					items : x('.fc-org', [{
						data : x('.fc-org h2 a@href', {
							name : '.idea-user-name h1.title',
							about : '.profile-public .rnd.white-grey.margin-bot10 .ml .mr .mm .inline-edit-table #preview-bio .whole-text',
							website : '.profile-public .rnd.white-grey.margin-bot10 .inline-edit-table tr:nth-of-type(2) td.value a@href',
							address1 : '.profile-public .fitconnect-address .line:nth-of-type(1)',
							address2 : '.profile-public .fitconnect-address .line:nth-of-type(2)',
							phone : '.profile-public .rnd.white-grey.margin-bot10 .inline-edit-table tr:nth-of-type(4) td.value',
							certifications : x('.profile-public .ml .mr .mm .rnd.white-grey .org-cert-type', [{
								title : '.title',
								attrs : x('.profile-public .ml .mr .mm .rnd.white-grey .org-cert-type .org-cert-type-details tr', [{
									label : 'td.label',
									value : 'td.value'
								}])
							}])
						})//,
						//name : 'h1'
					}])
				}
				).paginate('.pager-next@href')
					.write('results-full.json')
			});
		},
		processOrganization: function (url) {
			return new Promise(function (resolve, reject) {
				x(url,
					{
						name : '.idea-user-name h1.title',
						about : '.profile-public .rnd.white-grey.margin-bot10 .ml .mr .mm .inline-edit-table #preview-bio .whole-text',
						website : '.profile-public .rnd.white-grey.margin-bot10 .inline-edit-table tr:nth-of-type(2) td.value a@href',
						address1 : '.profile-public .fitconnect-address .line:nth-of-type(1)',
						address2 : '.profile-public .fitconnect-address .line:nth-of-type(2)',
						phone : '.profile-public .rnd.white-grey.margin-bot10 .inline-edit-table tr:nth-of-type(4) td.value',
						certifications : x('.profile-public .ml .mr .mm .rnd.white-grey .org-cert-type', [{
							title : '.title',
							attrs : x('.profile-public .ml .mr .mm .rnd.white-grey .org-cert-type .org-cert-type-details tr', [{
								label : 'td.label',
								value : 'td.value'
							}])
						}])
					})(function(err, response) {
					if(err){ console.log(err); return reject(err) }
					else {
						Scrape.transformItemResponse(response).then(resolve).catch(reject);
					}
				})
			});
		},
		transformItemResponse : function(response) {
			return new Promise(function (resolve, reject) {
				if (response.certifications && response.certifications.length) {
					for (var i = 0; i < response.certifications.length; i++) {
						response.certifications[i] = Scrape._transformCertTypeAttributes(response.certifications[i]);
					}
				}
				response.address = response.address1 + " " + response.address2;
				delete response.address1;
				delete response.address2;
				for (var thing in response) {
					if (typeof response[thing] == "string") {
						response[thing] = response[thing].strip();
					}
				}
				console.log("The response?:", response);
				return resolve(response);
			})
		},
		_transformCertTypeAttributes : function(obj) {
			var returnObj = {};
			returnObj.name = obj.title ? obj.title.strip() : '';
			if(obj.attrs && obj.attrs.length) {
				for(var i = 0; i < obj.attrs.length; i++) {
					var gotObj = obj.attrs[i];
					if(gotObj) {
						if(gotObj.label == 'Description') {
							returnObj.description = gotObj.value ? gotObj.value.strip() : undefined;
						}
						if(gotObj.label == 'Course Material Price') {
							returnObj.courseMaterialPrice = gotObj.value ? Number(gotObj.value.replace(/[^0-9\.]+/g,"")) : undefined;
						}
						if(gotObj.label == 'Exam Price') {
							returnObj.examPrice = gotObj.value ? Number(gotObj.value.replace(/[^0-9\.]+/g,"")) : undefined;
						}
						if(gotObj.label == 'Exam Delivery Method') {
							returnObj.examDeliveryMethod = gotObj.value ? gotObj.value.strip() : undefined;
						}
						if(gotObj.label == 'Accreditation'){
							returnObj.accreditation = gotObj.value ? gotObj.value.strip() : undefined;
						}
						if(gotObj.label == 'Practical Exam Required') {
							returnObj.practicalExamRequired = gotObj.value ? true : false
						}
						if(gotObj.label == 'Prerequisite') {
							returnObj.prerequisite = gotObj.value ? gotObj.value.strip() : undefined;
						}
						if(gotObj.label == 'Renewal Period') {
							returnObj.renewalPeriod = gotObj.value ? gotObj.value.strip() : undefined;
						}
						if(gotObj.label == "CEC's/CEUs per renewal period") {
							returnObj.CECorCEUperRenewalPeriod = gotObj.value ? Number(gotObj.value.replace(/[^0-9\.]+/g,"")) : undefined;
						}
						if(gotObj.label == 'Renewal Fee') {
							returnObj.renewalFee = gotObj.value ? Number(gotObj.value.replace(/[^0-9\.]+/g,"")) : undefined;
						}
						if(gotObj.label == 'Term Used for Continuing Education') {
							returnObj.continuingEducationTerm = gotObj.value ? gotObj.value.strip() : undefined;
						}
						if(gotObj.label == 'Category') {
							returnObj.category = gotObj.value ? gotObj.value.split(/\s*,\s*/) : undefined;
						}
					}

				}
			}
			return returnObj;
		},
		saveResponse : function(obj) {
			return new Promise(function(resolve, reject){
				var subCerts = obj.certifications;
				certificationOrganizationModel.findOne({name : obj.name}, function(err, certificationOrganization){
					if(err) return reject(err);
					if(certificationOrganization) {
						console.log("Found cert by name: ", obj.name);
						if(subCerts && subCerts.length) {
							Scrape.saveTypesUnderOrganization(certificationOrganization, subCerts).then(function(response){
								return resolve(certificationOrganization);
							}).catch(reject);
						}
						else {
							return resolve(certificationOrganization);
						}
					}
					if(!certificationOrganization) {
						delete obj.certifications; // get rid of these right now
						var newOrganization = new certificationOrganizationModel(obj);
						console.log("NEWORG?", newOrganization);
						console.log("Should be saving new cert org");
						newOrganization.save(function(err, savedOrganization){
							if(err) return reject(err);
							if(subCerts && subCerts.length) {
								Scrape.saveTypesUnderOrganization(savedOrganization, subCerts).then(function(response){
									return resolve(savedOrganization);
								}).catch(reject);
							}
						});
					}
				})
			})
		},
		saveTypesUnderOrganization : function(org, subCerts) {
			return new Promise(function(resolve, reject){
				async.each(subCerts, function(subCert, callback){
					certificationTypeModel.findOne({'name' : subCert.name, 'organization' : org._id.toString()}, function(err, foundCertType) {
						if(err) return callback(err);
						if(!foundCertType){
							console.log("INSERTING A NEW CERT TYPE");
							var newSubCertModel = new certificationTypeModel(subCert);
							newSubCertModel.organization = org._id.toString();
							console.log("newSubCert:", newSubCertModel);
							newSubCertModel.save(function(err, saved){
								if(err) callback(err);
								else { callback(null) }
							})
						}
						else {
							console.log("CERT TYPE FOUND, CALLING .save()");
							// invoke the save just to appl;y the post save methods on the certType model
							foundCertType.save(function(err, savedFoundCertType){
								if(err) return callback(err);
								return callback(null, savedFoundCertType);
							})
						}
					})
				}, function(err, response){
					if(err) return reject(err);
					return resolve(response);
				})
			})
		},
		saveFromFile : function(arrayImportedFromFile) {
			return new Promise(function(resolve, reject){
				var pageIndex = 1;
				async.each(arrayImportedFromFile, function(item, outerCallback){
					var page = item.items;
					console.log("Attempting a page : " + pageIndex++);
					async.each(page, function(cert, innerCallback) {
						cert = cert.data;
						Scrape.transformItemResponse(cert).then(function(transformedCert){
							Scrape.saveResponse(transformedCert).then(function(response){
								innerCallback(null)
							}).catch(innerCallback);
					}, function(err, response){
						if(err) outerCallback(err);
						else outerCallback();
					})
					/*
					var cert = item.data;
					// transform that \t \n bs before inserting it into the db.
					Scrape.transformItemResponse(cert).then(function(transformedCert){
						Scrape.saveResponse(transformedCert).then(function(response){
							callback(null)
						}).catch(callback);
						*/
					})
				}, function(err, response){
					if(err) return reject(err);
					console.log("COMPLETELY DONE");
					resolve(response);
				})
			});
		}
	};
	register(null, {
		scraper : Scrape
	});
};

String.prototype.strip = function() {
	return this.replace(/(\r\n|\n|\r)/gm,"").trim();
}
function StripText(input) {
	return input.replace(/(\r\n|\n|\r)/gm,"");
}
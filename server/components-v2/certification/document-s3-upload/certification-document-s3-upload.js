var config = require("../../../config/environment"),
	Promise = require('promise'),
	gm,
	appRoot = require('app-root-path'),
	path = require('path'),
	async = require('async'),
	mime = require('mime'),
	crypto = require('crypto'),
	fs = require("fs"),
	expect = require('chai').expect
;
module.exports = function setup(options, imports, register) {
	var s3 = imports.s3;
	var certificationDocumentS3Upload = {
		/**
		 *
		 * @param filepath - the full filepath on our server
		 * @param filename - just the filename, we could probably just grab this anyways, but pass it in...
		 * @returns {Promise}
		 */
		upload : function(req) {
			return new Promise(function(resolve, reject){
				expect(req.trainer).to.exist;
				expect(req.file).to.exist;
				certificationDocumentS3Upload
					.uploadFromFilepathAndFilename(req.file.path, req.file.filename)
					.then(function(response){
						req.file.s3_url = response.s3_url;
					return resolve(req);
				}).catch(reject);
			});
		},
		uploadFromFilepathAndFilename : function(filepath, filename) {
			return new Promise(function(resolve, reject) {
				console.log("Attempting to upload file at filepath:", filepath);
				var headers = {
						'x-amz-acl': 'public-read'
					},
					s3filepath = "certifications/trainers/" + filename
					;

				// fs.stat took too long just to get the file size...
				// fs.stat(filepath, function(err, stats) {
				//if(err) return reject(err);
				s3.putFile(filepath, s3filepath, headers, function(err, response){
					if(!response || err) {
						return reject(err);
					}
					else if(response.statusCode !== 200 ) {
						console.error(response.statusCode, 'error streaming image!', err);
						console.error("response.errorMessage?", response.errorMessage, " ... ", response.errorCode);
						return reject(false);
					}
					else if(response && response.statusCode == 200) {
						var response = {
							s3_url : "http://lungeapp.s3.amazonaws.com/" + s3filepath
						};
						console.log("AWS response we created and sending back:", response);
						return resolve(response)
					}
				})
				//})
			})
		}
	};
	function getFilename(trainer, filepath) {
		var splitEmail = trainer.email.split('@'),
			emailFirstHalf = splitEmail[0]
			;
		return trainer.id + "_" + emailFirstHalf
	}
	register(null, {
		certificationDocumentS3Upload : certificationDocumentS3Upload
	})
}
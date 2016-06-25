var config = require('../../../config/environment'),
	mime = require('mime'),
	path = require('path'),
	appRoot = require('app-root-path'),
	maxFileMegabytes = 2, //MB. Set this value, the maxFileSize will be inferred
	maxFileSize = maxFileMegabytes * 1000000,
	fs = require('fs'),
	validationError = function(res, err) {
		return res.json(422, err);
	};

var errors = {
	file_too_large : 'The file must be less than ' + maxFileSize / 1000000
	+ 'mb. Please try uploading a smaller file',
	invalid_mime_type : 'You must upload an image with a ".jpg" or ".png" exrension.'
};
var validMimeTypes = ['image/png', 'image/jpeg'],
	mainServerDirectory = config.env === 'production' ? "server" : "server",
	relativeFilePath = "/uploads/certifications/"
	;
var multer = require('multer');
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		var destination = mainServerDirectory + relativeFilePath;
		req.body.newFileDestination = destination;
		cb(null, destination)
	},
	filename: function (req, file, cb) {
		try {
			var name,
				splitEmail = req.body.trainer.email.split('@'),
				emailFirstHalf = splitEmail[0];
			name = req.body.trainer.id
			+ "_" + emailFirstHalf
			+ "_" + req.body.certificationV2.certification_type.organization.name.replace(/([^a-z0-9]+)/gi, '-')
			+ "_" + req.body.certificationV2.certification_type.name.replace(/([^a-z0-9]+)/gi, '-')
			+ "_" + Date.now()
			+ path.extname(file.originalname)
			;
			name = path.normalize(name.toLowerCase().replace(/ /g, '-'));
		}
		catch(err) {
			return cb(err);
		}
		cb(null, name)
	}
})
var multerUpload = multer(
	{
		storage: storage,
		limits : {
			fileSize : config.certification.upload.maxSize * 1024 * 1024,
			fieldSize : 1* 1024 * 1024
		}
	}
);
var up = multerUpload.single('file');

module.exports = function setup(options, imports, register) {
	var certificationDocumentS3Upload = imports.certificationDocumentS3Upload;
	var certificationDocumentUpload = {
		upload : function(req) {
			return new Promise(function(resolve, reject){
				var res = {}; // not using this, so it doesn't matter.
				up(req, res, function(err){
					if(err) {
						return reject(err);
					}
					// for redundant clarity.  so we know.
					req.file.user_desired_name = req.body.filename;
					req.file.certificationV2 = req.body.certificationV2;
					console.log("REQ FILE CERT IS:", req.file.certificationV2);
					// I'm not using the response, I'm just resolving with the req object.
					var response = {
						user_desired_name : req.body.filename,
						path : req.file.path,
						destination : req.file.destination,
						filename : req.file.filename,
						size : req.file.size,
						originalname : req.file.originalname,
						mimetype : req.file.mimetype,
						encoding : req.file.encoding
					};
					return resolve(req);
				});
			});
		}
	};
	register(null, {
		certificationDocumentUpload : certificationDocumentUpload
	})
}
function validateMimeType(mimetype) {
	if(validMimeTypes.indexOf(mimetype) == -1) {
		return false
	}
	return true;
}
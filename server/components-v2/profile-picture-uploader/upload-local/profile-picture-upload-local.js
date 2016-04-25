var config = require('../../../config/environment'),
	mime = require('mime'),
	path = require('path'),
	appRoot = require('app-root-path'),
	maxFileMegabytes = 2, //MB. Set this value, the maxFileSize will be inferred
	maxFileSize = maxFileMegabytes * 1000000,
	fs = require('fs'),
	validationError = function(res, err) {
		return res.json(422, err);
	},
	multer = require('multer')
;

var validMimeTypes = ['image/png', 'image/jpeg'],
	mainServerDirectory = config.env === 'production' ? "server" : "server",
	relativeFilePath = "/uploads/profile-pictures/"
	;

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		var destination = mainServerDirectory + relativeFilePath;
		req.body.newFileDestination = destination;
		console.log("FILE IS:", file);
		req.file = file;
		cb(null, destination)
	},
	filename: function (req, file, cb) {
		try {
			var name,
				splitEmail = req.trainer.email.split('@'),
				emailFirstHalf = splitEmail[0];
			name = req.trainer.id
			+ "_" + emailFirstHalf
			+ "_" + req.body.filename
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
			fileSize : config.profile_picture.upload.maxSize * 1024 * 1024,
			fieldSize : 1* 1024 * 1024
		}
	}
);
var up = multerUpload.single('file');
module.exports = function setup(options, imports, register){
	var profilePictureUploadLocal = {
		upload : function(req, res) {
			return new Promise(function(resolve, reject) {
				var res = {}; // not using this, so it doesn't matter.
				up(req, res, function (err) {
					if (err) {
						console.log("Local profile picture upload error.  Rejecting");
						req.uploadError = err;
						return reject(err);
					}
					// for redundant clarity.  so we know.
					//req.file.user_desired_name = req.body.filename;
					//req.file.certification = req.body.certification;
					// I'm not using the response, I'm just resolving with the req object.
					//var response = {
					//	path: req.file.path,
					//	destination: req.file.destination,
					//	filename: req.file.filename,
					//	size: req.file.size,
					//	mimetype: req.file.mimetype,
					//	encoding: req.file.encoding
					//};
					return resolve(req);
				});
			});
		}
	};
	register(null, {
		profilePictureUploadLocal : profilePictureUploadLocal
	})
}
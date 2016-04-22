var config = require('../../../../config/environment'),
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

var customValidationError = function(res, errField, errMessage) {
	var err = {
		message : 'Custom Validation Failed',
		name : 'CustomValidationError',
		errors : {
		}
	};
	err.errors[errField] = {
		message : errMessage,
		name : 'CustomValidationError',
		path : errField,
		type : 'custom'
	};
	console.log("Returning validation error:", err);
	return validationError(res, err);
};

var validMimeTypes = ['image/png', 'image/jpeg'],
	relativeFilePath = "/assets/images/trainers/",
	mainPublicDirectory = config.env === 'production' ? "/public" : "/client"
	;

function upload(req, res) {
	req.files = {};
	var tmpUploadPath,
		targetPath,
		userfilename;
	console.log('imageProfilePictureLocalUploader.upload called');
	req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
		console.log("gotfile");
		if(!validateMimeType(mimetype)) return customValidationError(res, 'file',
			errors.invalid_mime_type);
		console.log("OK mimetype:", mimetype);
		userfilename = filename;
		tmpUploadPath = path.join(appRoot + mainPublicDirectory + relativeFilePath + filename);
		targetPath = path.join(__dirname, "uploads/", filename);

		file.on('data', function(data) {
			if(data.length > maxFileSize) {
				return customValidationError(res, 'file', errors.file_too_large);
			}
		});
		file.pipe(fs.createWriteStream(tmpUploadPath));
	});
	req.busboy.on('error', function(err) {
		console.error('Error while parsing the form: ', err);
	})
	req.busboy.on('finish', function() {
		console.log('Done uploading the image to:');
		console.log(tmpUploadPath);
		var response = {
			url : relativeFilePath + userfilename
		}
		res.json(response);
	})
// required - start the <parsing></parsing>
	req.pipe(req.busboy);
}

function validateMimeType(mimetype) {
	if(validMimeTypes.indexOf(mimetype) == -1) {
		return false
	}
	return true;
}


module.exports = function setup(options, imports, register) {
	var	imageProfilePictureLocalUpload = {
		upload : upload
	};
	register(null, {
		imageProfilePictureLocalUpload : imageProfilePictureLocalUpload
	})
}

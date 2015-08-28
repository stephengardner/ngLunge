// AWS.controller.js
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var appRoot = require('app-root-path');
//var multer = require('multer');
var config = require('../../config/environment');
var gm;

// if production, we are on heroku, so use herokus instance of ImageMagick (it doesn't have graphicsmagick)
if(config.env == "production") {
	gm = require('gm').subClass({ imageMagick: true });
}
else {
	gm = require('gm');
};
var mime = require('mime');
//.subClass({ imageMagick: true });
//var im = require('imagemagick');
var $q = require('q');

var Knox = require('knox');
var client = Knox.createClient({
	key: config.AWS.AWS_ACCESS_KEY_ID,
	secret: config.AWS.AWS_SECRET_ACCESS_KEY,
	bucket: config.AWS.S3_BUCKET
});
var validMimeTypes = ['image/png', 'image/jpeg'];
var AWS = require('aws-sdk');
//AWS.config.loadFromPath('./config.json');
var s3 = new AWS.S3();
var validationError = function(res, err) {
	return res.json(422, err);
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

var mainPublicDirectory = config.env === 'production' ? "/public" : "/client"; // on heroku it's called "public"
var maxFileMegabytes = 2, //MB. Set this value, the maxFileSize will be inferred
	maxFileSize = maxFileMegabytes * 1000000;


module.exports = function(app) {
	var AWS = {};
	AWS.upload = function(req, res) {
		/* works for multer
		 var file = req.files.file;
		 console.log(file);

		 multer.postImageProcessing = function (something){
		 console.log(something);
		 };
		 */
		req.files = {};
		var tmpUploadPath;
		var filenameGlobal;
		var relativeFilePath;
		req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
			if(validMimeTypes.indexOf(mimetype) == -1) {
				return customValidationError(res, 'file', 'You must upload an image with a ".jpg" or a ".png" extension.');
			}
			filenameGlobal = filename;
			realativeFilePath = "/assets/images/trainers/" + filename;
			tmpUploadPath = path.join(appRoot + mainPublicDirectory + realativeFilePath);//"/uploads" + filename;//path.join(__dirname, "uploads/", filename);
			targetPath = path.join(__dirname, "uploads/", filename);

			var imageName = filename;
			var imageUrl = filename;
			file.on('data', function(data) {
				if(data.length > maxFileSize) {
					return customValidationError(res, 'file', 'The file must be less than ' + maxFileSize / 1000000 + 'mb.  Please try uploading a smaller file.');
				}
				console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
			});
			file.on('end', function(data) {
				console.log("DATA:", data);
				console.log('File [' + fieldname + '] Finished');
			});
			file.pipe(fs.createWriteStream(tmpUploadPath));
		});

		req.busboy.on('error', function(err) {
			console.error('Error while parsing the form: ', err);
			//next(err);
		});

		req.busboy.on('finish', function() {
			console.log('Done uploading the image to:');
			console.log(tmpUploadPath);
			var response = {
				url : realativeFilePath
			}
			res.json(response);
			var resizeFilename = tmpUploadPath;//path.join(__dirname, "uploads/", "Step 2.png");
			/*
			 console.log("Resizing: ", resizeFilename);

			 // GRAPHICSMAGICK - WORKS
			 var done = gm(resizeFilename).size(function(err, val) {
			 console.log("size:", val);
			 ;
			 }).resize(500, 500).write(resizeFilename, function (err) {
			 if (!err) console.log(' hooray! ');
			 else console.log(err);
			 });//, 200, 'red');
			 console.log("done is: ", done);
			 */
			/*
			 IMAGEMAGICK - WORKS
			 im.resize({
			 srcPath : resizeFilename ,
			 dstPath : resizeFilename,
			 width: 500,
			 height: 500
			 }, function(err, stdout, stderr){
			 console.log("!");
			 if (err) {
			 console.log('error while resizing images' + stderr);
			 }
			 console.log(err, stdout, stderr);
			 //console.log( process.cwd() + '/tmp/Images/' + req.files.image.name + 'has been resized and saved as ' + process.cwd() + '/tmp/Images/resized_'+req.files.image.name)
			 });
			 */
		});

		// Start the parsing
		req.pipe(req.busboy);

	};

	var getImageRatio = function(filePath, userCoords, callback) {
		console.log("Calling gm('" + filePath + "').size()...");
		gm(filePath).size(function(err, val) {
			console.log("the size is: ", val);
			console.log("err?: ", err);
			if(!val) {
				//TODO send a descriptive error, however, the client side is handling this gracefully
				return callback(true);
			}
			var originalWidth = val.width;
			console.log("the user coords are: ", userCoords);
			callback(err, originalWidth / userCoords.imageWidth);
		});
	};

	var sendToS3 = function(filePath, buf, req){
		var deferred = $q.defer();
		var headers = {
				'Content-Length': buf.length,
				'Content-Type': mime.lookup(filePath),
				'x-amz-acl': 'public-read'
			},
			userEmail = req.trainer.email;
		userEmail = userEmail.split("@");
		userEmail = userEmail[0];
		var newS3FileName = userEmail + "_" + crypto.randomBytes(10).toString('hex');
		console.log("Streaming to: ", "/profile-pictures/trainers/" + newS3FileName + path.extname(filePath));
		client.putBuffer( buf, "/profile-pictures/trainers/" + newS3FileName + path.extname(filePath), headers, function(err, response){
			//console.log("Response in client.putBuffer is: ", response);
			console.log("The fucking status code was:", response.statusCode);
			if (!response || err) {
				if(response) {
					console.log("STATUS CODE: ", response.statusCode);
					console.log("PATH: ", response.path);
					console.log("ErrorCode: ", response.errorCode);
				}
				else {
					console.log("streaming image left no response...");
				}
				console.error('error streaming image:', err);
				//console.error('---- error streaming image!', err.code);
				deferred.reject(err);
				//return next(err);
			}
			else if (response.statusCode !== 200) {
				console.error(response.statusCode, 'error streaming image!', err);
				console.error("response.errorMessage?", response.errorMessage, " ... ", response.errorCode);
				deferred.reject(false);
				//return next(err);
			}
			else if(response && response.statusCode == 200) {
				console.log('Your file was uploaded');
				console.log('Amazon response statusCode: ', response.statusCode);
				deferred.resolve({ url : "http://lungeapp.s3.amazonaws.com/profile-pictures/trainers/" + newS3FileName + path.extname(filePath)});
			}
			else {
				deferred.reject(false);
			}

			//res.send({ url : "http://lungeapp.s3.amazonaws.com/profile-pictures/trainers/" + newS3FileName + path.extname(filePath)});
		});
		return deferred.promise;
	}
	AWS.crop = function(req, res) {
		var deferred = $q.defer();
		//console.log("the request body is:", req.body);
		var userFilePath = req.body.filepath;
		var userCoords = req.body.coords;
		console.log("user cords:", userCoords);
		var filePath = path.join(appRoot + mainPublicDirectory + userFilePath);
		console.log("filepath on OUR server: " ,filePath);
		getImageRatio(filePath, userCoords, function(err, imageRatio){
			if(err) {
				return validationError(res, err);
			}
			console.log("The image ratio is: ", imageRatio);
			console.log("cropping: ", userCoords.width * imageRatio, userCoords.height * imageRatio, userCoords.x1 * imageRatio, userCoords.y1 * imageRatio);
			gm(filePath).crop(userCoords.width * imageRatio, userCoords.height * imageRatio, userCoords.x1 * imageRatio, userCoords.y1 * imageRatio).resize(300, 300).stream(function(err, stdout, stderr) {
				var buf = new Buffer('');
				if(err) {
					return validationError(res, err);
				}
				stdout.on('data', function(data) {
					buf = Buffer.concat([buf, data]);
				});
				stdout.on('end', function(data) {
					sendToS3(filePath, buf, req).then(function(res){
						console.log("Lunge: Image upload succeeded");
						deferred.resolve(res);
					}, function(err){
						console.log("Lunge: Image upload failed");
						console.log("cropImage SendtoS3 err on resolve: ", err);
						return validationError(res, err);
					});
				});
			});
		});
		return deferred.promise;
	}

	return AWS;
};
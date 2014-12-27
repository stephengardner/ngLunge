// AWS.controller.js
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var appRoot = require('app-root-path');
//var multer = require('multer');
var gm = require('gm');
var mime = require('mime');
//.subClass({ imageMagick: true });
//var im = require('imagemagick');
var $q = require('q');
var AWS = require('aws-sdk');
var Knox = require('knox');
//AWS.config.loadFromPath('./config.json');
var s3 = new AWS.S3();
var config = require('../../config/environment');

var client = Knox.createClient({
	key: config.AWS.AWS_ACCESS_KEY_ID,
	secret: config.AWS.AWS_SECRET_ACCESS_KEY,
	bucket: config.AWS.S3_BUCKET
});
var s3UploadService = function(req, res) {
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
		filenameGlobal = filename;
		realativeFilePath = "/assets/images/trainers/" + filename;
		tmpUploadPath = path.join(appRoot + "/client" + realativeFilePath);//"/uploads" + filename;//path.join(__dirname, "uploads/", filename);
		targetPath = path.join(__dirname, "uploads/", filename);

		var imageName = filename;
		var imageUrl = filename;

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
	gm(filePath).size(function(err, val) {
		console.log("the size is: ", val);
		console.log("err?: ", err);
		var originalWidth = val.width;
		console.log("the user coords are: ", userCoords);
		callback(originalWidth /userCoords.imageWidth);
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
		if (!response || err) {
			console.log("streaming image left no response...");
			console.log("RESPONSE:", response);
			console.error('error streaming image!', err);
			deferred.reject(err);
			//return next(err);
		}
		else if (response.statusCode !== 200) {
			console.log("RESPONSE:", response);
			console.error(response.statusCode, 'error streaming image!', err);
			//return next(err);
		}
		if(response) {
			console.log("Amazon's response was: ", response.path);
			console.log('Amazon response statusCode: ', response.statusCode);
		}
		console.log('Your file was uploaded');
		deferred.resolve({ url : "http://lungeapp.s3.amazonaws.com/profile-pictures/trainers/" + newS3FileName + path.extname(filePath)});

		//res.send({ url : "http://lungeapp.s3.amazonaws.com/profile-pictures/trainers/" + newS3FileName + path.extname(filePath)});
	});
	return deferred.promise;
}
var cropImage = function(req, res) {
	var deferred = $q.defer();
	console.log("the request body is:", req.body);
	var userFilePath = req.body.filepath;
	var userCoords = req.body.coords;
	console.log("user cords:", userCoords);
	var filePath = path.join(appRoot +  "/client" + userFilePath);
	console.log("filepath on OUR server: " ,filePath);
	getImageRatio(filePath, userCoords, function(imageRatio){
		console.log("The image ratio is: ", imageRatio);
		console.log("cropping: ", userCoords.width * imageRatio, userCoords.height * imageRatio, userCoords.x1 * imageRatio, userCoords.y1 * imageRatio);
		gm(filePath).crop(userCoords.width * imageRatio, userCoords.height * imageRatio, userCoords.x1 * imageRatio, userCoords.y1 * imageRatio).resize(300, 300).stream(function(err, stdout, stderr) {
			var buf = new Buffer('');

			stdout.on('data', function(data) {
				buf = Buffer.concat([buf, data]);
			});

			stdout.on('end', function(data) {
				sendToS3(filePath, buf, req).then(function(res){
					deferred.resolve(res);
				}, function(err){
					console.log("cropImage SendtoS3 err on resolve: ", err);
				});
			});
		});
	});
	return deferred.promise;
}
exports.upload = s3UploadService;
exports.crop = cropImage;
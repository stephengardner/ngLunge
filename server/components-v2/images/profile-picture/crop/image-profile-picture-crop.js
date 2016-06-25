
var config = require("../../../../config/environment"),
	gm,
	mainPublicDirectory = config.env === 'production' ? "/public" : "/client",
	appRoot = require('app-root-path'),
	path = require('path'),
	async = require('async'),
	mime = require('mime'),
	crypto = require('crypto'),
	Knox = require('knox'),
	client = Knox.createClient({
		key: config.AWS.AWS_ACCESS_KEY_ID,
		secret: config.AWS.AWS_SECRET_ACCESS_KEY,
		bucket: config.AWS.S3_BUCKET
	}),
	AWS = require('aws-sdk'),
	s3 = new AWS.S3()
	;
if(config.env == 'production'){
	gm = require('gm').subClass({ imageMagick : true });
}
else {
	gm = require('gm');
}

function getImageRatio(filepath, userCoords) {
	return new Promise(function(resolve, reject){
		console.log("Calling gm('" + filepath + "').size()...");
		gm(filepath).size(function(err, val) {
			console.log("the size is: ", val);
			console.log("err?: ", err);
			if(!val) {
				return resolve(true);
				//TODO send a descriptive error, however, the client side is handling this gracefully
			}
			if(err) return reject(err);
			var originalWidth = val.width;
			console.log("the user coords are: ", userCoords);
			return resolve(originalWidth / userCoords.imageWidth);
		});
	})
}

function crop(filepath, userCoords, imageRatio) {
	return new Promise(function(resolve, reject){
		gm(filepath).crop(userCoords.width * imageRatio,
			userCoords.height * imageRatio,
			userCoords.x1 * imageRatio,
			userCoords.y1 * imageRatio)
			.resize(300, 300)
			.stream(function(err, stdout, stderr){
				if(err) return reject(err);
				var buf = new Buffer('');
				stdout.on('data', function(data){
					buf = Buffer.concat([buf, data]);
				});
				stdout.on('end', function(data) {
					return resolve(buf);
				})
			})
	})
}

function sendToS3(filepath, buffer, email) {

}
module.exports = function setup(options, imports, register) {
	var imageProfilePictureCrop = {
		crop : function(filepath, coords){
			return new Promise(function(resolve, reject) {
				var userCoords = coords,
					localFilepath = path.join(appRoot + mainPublicDirectory + filepath)
					;
				async.waterfall([
					function getRatio(callback) {
						getImageRatio(localFilepath, userCoords).then(function(imageRatio){
							callback(null, imageRatio);
						}).catch(callback)
					},
					function doCrop(imageRatio, callback) {
						crop(localFilepath, userCoords, imageRatio).then(function(buffer){
							callback(null, buffer);
						}).catch(callback);
					}
				], function(err, buffer){
					if(err) return reject(err);
					return resolve({
						localFilepath : localFilepath,
						buffer : buffer
					});
				})
			})
		}
	};
	register(null, {
		imageProfilePictureCrop : imageProfilePictureCrop
	})
}
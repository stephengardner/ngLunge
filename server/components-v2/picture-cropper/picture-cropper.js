
var config = require('../../config/environment'),
	gm,
	async = require('async'),
	expect = require('chai').expect,
	crypto = require('crypto')
	;
if(config.env == "production") {
	gm = require('gm').subClass({ imageMagick: true });
}
else {
	gm = require('gm');
};

var mime = require('mime');

module.exports = function setup(options, imports, register) {
	var imageDefaultSize = {
		width : 300,
		height : 300
	}
	var pictureCropper = {
		crop : function(req) {
			if(req.body.url) {
				req.body.filepath = req.body.url;
			}
			expect(req.body).to.have.property('filepath');
			expect(req.body).to.have.property('coords');
			return new Promise(function(resolve, reject) {
				async.waterfall([
					function getRatio(callback) {
						getImageRatio(req).then(function(response){
							callback();
						}).catch(callback);
					},
					function crop(callback) {
						doCrop(req).then(function(unusedResponse){
							callback();
						}).catch(callback);
					},
					//function s3(callback) {
					//	sendToS3.then(function(response){
					//		callback();
					//	}).catch(callback);
					//}
				], function(err, results){
					if(err) return reject(err);
					return resolve(results);
				})
			})
		}
	};
	function doCrop(req) {//filePath, userCoords, imageRatio) {
		return new Promise(function(resolve, reject) {
			var filepath = req.body.filepath;
			var userCoords = req.body.coords;
			var imageRatio = req.imageRatio;

			gm(filepath).crop(userCoords.width * imageRatio,
				userCoords.height * imageRatio,
				userCoords.x1 * imageRatio,
				userCoords.y1 * imageRatio)
				.resize(imageDefaultSize.width, imageDefaultSize.height)
				.stream(function(err, stdout, stderr) {
					var buf = new Buffer('');
					if(err) {
						return reject(err);
					}
					stdout.on('data', function(data) {
						buf = Buffer.concat([buf, data]);
					});
					stdout.on('end', function(data) {
						/*
						sendToS3(filePath, buf, req).then(function(res){
							console.log("Lunge: Image upload succeeded");
							deferred.resolve(res);
						}, function(err){
							console.log("Lunge: Image upload failed");
							console.log("cropImage SendtoS3 err on resolve: ", err);
							return validationError(res, err);
						});
						*/
						req.imageBuffer = buf;
						return resolve(true);
					});
				});
		})
	}

	function sendToS3(req) {
		return new Promise(function(resolve, reject){
			var filepath = req.body.filepath;
			var headers = {
					'Content-Length': buf.length,
					'Content-Type': mime.lookup(filepath),
					'x-amz-acl': 'public-read'
				},
				userEmail = req.trainer.email;
			userEmail = userEmail.split("@");
			userEmail = userEmail[0];
			var newS3FileName = userEmail + "_" + crypto.randomBytes(10).toString('hex');
			resolve();
		});
	}
	function getImageRatio(req) {
		return new Promise(function(resolve, reject){
			var filepath = req.body.filepath;
			var userCoords = req.body.coords;
			gm(filepath).size(function(err, val) {
				if(err) return reject(err);
				if(!val) {
					return reject(true);
				}
				var originalWidth = val.width;
				var userCoordsWidth = userCoords.imageWidth;
				req.imageRatio = originalWidth / userCoordsWidth;
				return resolve(true)
			})
		})
	}
	register(null, {
		pictureCropper : pictureCropper
	})
}
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
module.exports = function setup(options, imports, register) {
	var imageProfilePictureS3Upload = {
		upload : function(trainer, filepath, buffer) {
			return new Promise(function(resolve, reject) {
				var headers = {
						'Content-Length': buffer.length,
						'Content-Type': mime.lookup(filepath),
						'x-amz-acl': 'public-read'
					},
					splitEmail = trainer.email.split('@'),
					emailFirstHalf = splitEmail[0],
					newS3Filename = emailFirstHalf + '_' + crypto.randomBytes(10).toString('hex'),
					s3filepath = "profile-pictures/trainers/" + newS3Filename + path.extname(filepath)
					;
				client.putBuffer(buffer, s3filepath, headers, function(err, response){
					if(!response || err) {
						return reject(err);
					}
					else if(response.statusCode !== 200 ) {
						console.error(response.statusCode, 'error streaming image!', err);
						console.error("response.errorMessage?", response.errorMessage, " ... ", response.errorCode);
						return reject(false);
					}
					else if(response && response.statusCode == 200) {
						console.log("image uploaded.");
						return resolve({
							url : "http://lungeapp.s3.amazonaws.com/profile-pictures/trainers/"
							+ newS3Filename + path.extname(filepath)
						})
					}
				})
			})
		}
	};
	register(null, {
		imageProfilePictureS3Upload : imageProfilePictureS3Upload
	})
}
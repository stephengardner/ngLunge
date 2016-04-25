var mime = require('mime'),
	expect = require('chai').expect,
	crypto = require('crypto'),
	config = require('../../../config/environment'),
	path = require('path'),
	Knox = require('knox'),
	client = Knox.createClient({
		key: config.AWS.AWS_ACCESS_KEY_ID,
		secret: config.AWS.AWS_SECRET_ACCESS_KEY,
		bucket: config.AWS.S3_BUCKET
	})
	;
module.exports = function setup(options, imports, register) {
	var profilePictureUploadS3 = {
		upload : function(req) {
			return new Promise(function(resolve, reject){
				// require imageBuffer, it's passed in because GM is creating a buffer
				// when it crops the photo!
				expect(req).to.have.property('imageBuffer');
				expect(req).to.have.property('trainer');
				expect(req.body).to.have.property('filepath');
				var filepath = req.body.filepath;
				var buf = req.imageBuffer;

				var headers = {
						'Content-Length': buf.length,
						'Content-Type': mime.lookup(filepath),
						'x-amz-acl': 'public-read'
					},
					userEmail = req.trainer.email;
				userEmail = userEmail.split("@");
				userEmail = userEmail[0];
				var newS3FileName = userEmail + "_" + crypto.randomBytes(10).toString('hex');
				console.log("Streaming to: ",
					"/profile-pictures/trainers/" + newS3FileName + path.extname(filepath));
				client.putBuffer(buf,
					"/profile-pictures/trainers/"
					+ newS3FileName
					+ path.extname(filepath), headers, function(err, response){
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
							return reject(err);
							//return next(err);
						}
						else if (response.statusCode !== 200) {
							console.error(response.statusCode, 'error streaming image!', err);
							console.error("response.errorMessage?", response.errorMessage, " ... ", response.errorCode);
							return reject(false);
							//return next(err);
						}
						else if(response && response.statusCode == 200) {
							console.log('Your file was uploaded');
							console.log('Amazon response statusCode: ', response.statusCode);
							return resolve({
								url :
								"http://lungeapp.s3.amazonaws.com/profile-pictures/trainers/"
								+ newS3FileName
								+ path.extname(filepath)
							});
						}
						else {
							return reject(false);
						}
					});
			});
		}
	};
	register(null, {
		profilePictureUploadS3 : profilePictureUploadS3
	})
}
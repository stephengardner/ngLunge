var config = require('../../config/environment'),
	knox = require('knox')
	;
module.exports = function setup(options, imports, register) {
	var client = knox.createClient({
		key : config.AWS.AWS_ACCESS_KEY_ID,
		secret : config.AWS.AWS_SECRET_ACCESS_KEY,
		bucket : config.AWS.S3_BUCKET
	});
	register(null, {
		s3 : client
	})
}; 
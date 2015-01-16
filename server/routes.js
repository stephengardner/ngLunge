/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var fs = require('fs');
var config = require('./config/environment');
var Knox = require('knox');
var AWS = require('aws-sdk');
console.log("THE CONFIG IS:::::::::::::::::::::::", config);
AWS.config.region = 'sa-east-1';
//console.log("AWS: ", AWS.config);
var knoxConfig = {
	key : config.AWS.AWS_ACCESS_KEY_ID,
	secret : config.AWS.AWS_SECRET_ACCESS_KEY,
	bucket : "lungeapp"
	//,region : "sa-east-1"
};
Knox.aws = Knox.createClient(knoxConfig);
var crypto = require("crypto");

module.exports = function(app) {
	// Insert routes below
	app.use('/api/things', require('./api/thing'));
	app.use('/api/users', require('./api/user'));
	app.use('/api/trainers', require('./api/trainer'));
	app.use('/api/aws', require('./api/aws'));
	app.use('/auth', require('./auth'));
	app.use('/api/registrations', require('./api/registration'));
	app.use('/api/certifications', require('./api/certification'));
	app.use('/api/certification-types', require('./api/certification-type'));

	// All undefined asset or api routes should return a 404
	app.route('/:url(trainer/api|auth|components|app|bower_components|assets)/*')
		.get(errors[404]);

	app.post('/uploads2', function(req, res, next) {
		var fstream;
		req.pipe(req.busboy);
		req.files = {};
		//req.busboy.on('file', function (fieldname, file, filename) {
		req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
			var fileSize = 0;
			var s3 = new AWS.S3();
			if (!filename) {
				// If filename is not truthy it means there's no file
				return;
			}
			// Create the initial array containing the stream's chunks
			file.fileRead = [];

			file.on('data', function(chunk) {
				// Push chunks into the fileRead array
				fileSize += chunk.length;
				this.fileRead.push(chunk);
			});

			file.on('error', function(err) {
				console.log('Error while buffering the stream: ', err);
			});

			file.on('end', function() {
				if(fileSize > 10 * 1026 * 1026) {
					console.log("well shit...");
					var error = {
						error : 'Please upload an image that is smaller than 10MB'
					};
					res.json(error);
					//next();
					//return next();
				}
				else {
					// Concat the chunks into a Buffer
					var finalBuffer = Buffer.concat(this.fileRead);

					req.files[fieldname] = {
						buffer: finalBuffer,
						size: finalBuffer.length,
						filename: filename,
						mimetype: mimetype
					};
					//var datePrefix = moment().format('YYYY[/]MM');
					var key = crypto.randomBytes(6).toString('hex');
					var hashFilename = key + '-' + filename;

					var pathToArtwork = 'profile-pictures/' + hashFilename;
					var headers = {
						'Content-Length': req.files[fieldname].size,
						'Content-Type': req.files[fieldname].mimetype,
						'x-amz-acl': 'public-read'
					};

					console.log("pathname = ", pathToArtwork);
					var returnObject = {};
					var knoxRequest = Knox.aws.putBuffer( req.files[fieldname].buffer, pathToArtwork, headers, function(err, response){
						// our ending s3 url is: knoxRequest.url!
						if (err) {
							console.error('error streaming image: ', new Date(), err);
							//return next(err);
						}
						if (response.statusCode !== 200) {
							console.error('error streaming image: ', new Date(), err);
							//return next(err);
						}
						returnObject.url = knoxRequest.url;
						res.json(returnObject);
						console.log('Amazon response statusCode: ', response.statusCode);
						//console.log(response);
						console.log(filename + ' was uploaded');
						//next();
					});

				}
			});


			/*
			 WORKING:
			 var s3bucket = new AWS.S3({params: {Bucket: 'golunge'}});
			 s3.listBuckets(function(err, data) {
			 for (var index in data.Buckets) {
			 var bucket = data.Buckets[index];
			 console.log("Bucket: ", bucket.Name, ' : ', bucket.CreationDate);
			 }
			 });
			 s3bucket.createBucket(function() {
			 var data = {Key: 'profile-pictures/trainers/test', Body: 'Hello!'};
			 s3bucket.putObject(data, function(err, data) {
			 if (err) {
			 console.log("Error uploading data: ", err);
			 } else {
			 console.log("Successfully uploaded data to myBucket/myKey");
			 }
			 });
			 });
			 console.log("hmm..");
			 */
			/*

			 console.log("Uploading: " + filename);
			 var filePath = __dirname + '/uploads/trainers/profile-pictures' + filename;
			 fstream = fs.createWriteStream(filePath);
			 file.pipe(fstream);
			 fstream.on('close', function () {

			 console.log("CLOSING");
			 console.log(file.path);
			 console.log("path:", filePath);

			 var returnObject = {
			 path : filePath
			 };
			 res.json(returnObject);
			 //res.redirect('back');
			 });
			 */
		});
	});
	// All other routes should redirect to the index.html
	app.route('/*')
		.get(function(req, res) {
			res.sendfile(app.get('appPath') + '/index.html');
		});
};

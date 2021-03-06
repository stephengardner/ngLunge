'use strict';

var path = require('path');
var _ = require('lodash');

if(!process.env.NODE_ENV) {
	console.warn("There's no node_env variable, so we're setting this to test and loading the 'all' set of env vars");
	process.env = _.merge(require("../local.env.js"));
	process.env.NODE_ENV = "test";
}

function requiredEnv(name) {
	if(!process.env[name]) {
		throw new Error('You must set the ' + name + ' environment variable');
	}
	return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
	env: process.env.NODE_ENV,

	DOMAIN : process.env.DOMAIN,

	// Root path of server
	root: path.normalize(__dirname + '/../../..'),

	// Server port
	port: process.env.PORT || 9000,

	// Should we populate the DB with sample data?
	seedDB: false,

	// Secret for session, you will want to change this and make it an environment variable
	secrets: {
		session: 'ng-lunge-full-stack2-secret'
	},

	// List of user roles
	userRoles: ['guest', 'user', 'admin'],

	// MongoDB connection options
	mongo: {
		options: {
			db: {
				safe: true
			}
		}
	},

	mandrill : {
		API_KEY : process.env.MANDRILL_API_KEY || "no-key"
	},

	redis : {
		redisToGoURL : process.env.REDISTOGO_URL || false
	},

	email : {
		admin : getEnv('EMAIL_ADMIN')  || 'opensourceaugie@gmail.com',
		adminTest : getEnv('EMAIL_ADMIN_TEST')  || 'opensourceaugie@gmail.com'
	},

	smartyStreets : {
		authId : getEnv('SMARTY_STREETS_AUTH_ID'),
		authToken : getEnv('SMARTY_STREETS_AUTH_TOKEN')
	},

	profile_picture : {
		upload : {
			maxSize : requiredEnv('PROFILE_PICTURE_UPLOAD_MAX_FILE_SIZE')
		}
	},
	certification : {
		upload : {
			maxSize : requiredEnv('CERTIFICATION_UPLOAD_MAX_FILE_SIZE')
		}
	},
	twilio : {
		notifier : {
			sid : process.env.TWILIO_SID_NOTIFIER,
			token : process.env.TWILIO_TOKEN_NOTIFIER,
			secret : process.env.TWILIO_SECRET_NOTIFIER
		}
	},
	facebook: {
		clientID:     process.env.FACEBOOK_ID || 'id',
		clientSecret: process.env.FACEBOOK_SECRET || 'secret',
		callbackURL:  (process.env.DOMAIN || '') + '/auth/facebook/callback',
		callbackTrainerURL:  (process.env.DOMAIN || '') + '/auth/facebook/callback-trainer-sync'
	},
	linkedin : {
		clientID:     process.env.LINKEDIN_ID || 'id',
		clientSecret: process.env.LINKEDIN_SECRET || 'secret',
		callbackURL:  (process.env.DOMAIN || '') + '/auth/linkedin/callback',
		callbackTrainerURL:  (process.env.DOMAIN || '') + '/auth/linkedin/callback-trainer-sync'
	},
	twitter: {
		clientID:     process.env.TWITTER_ID || 'id',
		clientSecret: process.env.TWITTER_SECRET || 'secret',
		callbackURL:  (process.env.DOMAIN || '') + '/auth/twitter/callback',
		callbackTrainerURL:  (process.env.DOMAIN || '') + '/auth/twitter/callback-trainer-sync'
	},

	instagram: {
		clientID:     requiredEnv('INSTAGRAM_ID'),
		clientSecret: requiredEnv('INSTAGRAM_SECRET'),
		callbackURL:  (process.env.DOMAIN || '') + '/auth/instagram/callback',
		callbackTrainerURL:  (process.env.DOMAIN || '') + '/auth/instagram/callback-trainer-sync'
	},

	google: {
		clientID:     process.env.GOOGLE_ID || 'no-id',
		clientSecret: process.env.GOOGLE_SECRET || 'secret',
		callbackURL:  (process.env.DOMAIN || '') + '/auth/google/callback',
		callbackTrainerURL:  (process.env.DOMAIN || '') + '/auth/google/callback-trainer-sync'
	},

	sendgrid : {
		clientSecret : requiredEnv('SENDGRID_API_SECRET')
	},

	AWS : {
		AWS_ACCESS_KEY_ID  : process.env.AWS_ACCESS_KEY_ID || 'no-id',
		AWS_SECRET_ACCESS_KEY : process.env.AWS_SECRET_ACCESS_KEY || 'no-id',
		S3_BUCKET : process.env.S3_BUCKET || 'no-bucket'
	},

	MAIL : {
		user : process.env.GMAIL_SEND_USER || "none",
		pass : process.env.GMAIL_SEND_PASS || "none"
	},

	SUPERUSERS : {
		ADMINS : [
			'augdog911@gmail.com',
			'augdog9114@gmail2.com'
		]
	}
};
function getEnv(variable){
	if (process.env[variable] === undefined){
		throw new Error('You must create an environment variable for ' + variable);
	}

	return process.env[variable];
};

// If the process is a foreman process, we haven't loaded in the environment variables (that's something grunt does
// for us), so manually load the local vars.
var fileToMerge, vars;
if(process.env.NODE_ENV != 'foreman') {
	fileToMerge = './' + process.env.NODE_ENV + '.js';
}
if(fileToMerge) {
	vars = require(fileToMerge)
}
else {
	vars = {};
}
// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
	all,
	//AWS,
	vars);
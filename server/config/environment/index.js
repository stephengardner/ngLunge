'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
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

	google: {
		clientID:     process.env.GOOGLE_ID || 'no-id',
		clientSecret: process.env.GOOGLE_SECRET || 'secret',
		callbackURL:  (process.env.DOMAIN || '') + '/auth/google/callback',
		callbackTrainerURL:  (process.env.DOMAIN || '') + '/auth/google/callback-trainer-sync'
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
			'augdog911@gmail.com'
		]
	}
};
// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
	all,
	//AWS,
	require('./' + process.env.NODE_ENV + '.js') || {});
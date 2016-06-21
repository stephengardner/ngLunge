'use strict';

// Use local.env.js for environment variables that grunt will set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.


module.exports = {
	DOMAIN: 'http://localhost:9000',
	SESSION_SECRET: "nglungefullstack2-secret",

	FACEBOOK_ID: '302242913297749',
	FACEBOOK_SECRET: '66d89b1d7d94b45b444a8ee6d7c851b2',

	TWITTER_ID: 'pRsQ5Mak7fxpnjZcajszHj8Qm',
	TWITTER_SECRET: '4DXvIxw8BUCFRhJrkoAwVRd6DBBdaeSi3LEOmf0iXAy7Bguo1i',

	GOOGLE_ID: '752326184705-9v4lg6n34rm32c6nfd7qt7qnn8ucanmv.apps.googleusercontent.com',
	GOOGLE_SECRET: '2rKVoYueJFtZxmQHbCYd1sif',

	LINKEDIN_ID : '78c2key7ro837d',
	LINKEDIN_SECRET : 'kVEtYfQ3CrX7cBef',

	SENDGRID_API_SECRET : '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',

	INSTAGRAM_ID : 'f8c38d7e17f3400694bfd43a11f8ae25',
	INSTAGRAM_SECRET : 'd60e204ebb6149baa5f834a19db42752',

	AWS_ACCESS_KEY_ID  : "AKIAICX5ZNINVQHWWT6Q",
	AWS_SECRET_ACCESS_KEY : "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",
	S3_BUCKET : "lungeapp",

	//REDISTOGO_URL : "redis://redistogo:b5a2ba89a399374bbc6a0ae177919204@stingfish.redistogo.com:9610/",
	REDISTOGO_URL : "redis://redistogo:4c2cf6bc1dfb778df5bda03b29d5cb7f@barb.redistogo.com:9701/",

	MANDRILL_API_KEY : 'QckrAdKqpJAKupwaBh12dQ',

	EMAIL_ADMIN : 'opensourceaugie@gmail.com',
	EMAIL_ADMIN_TEST : 'opensourceaugie@gmail.com',

	GMAIL_SEND_USER : "augdog911@gmail.com",
	GMAIL_SEND_PASS : "auGie109016308",

	SMARTY_STREETS_AUTH_ID : 'e8d46275-e58b-4b69-82c8-5d02745a5574',
	SMARTY_STREETS_AUTH_TOKEN : 'LCpI38kWxnO74Nw7ErxX',

	CERTIFICATION_UPLOAD_MAX_FILE_SIZE : 4,
	PROFILE_PICTURE_UPLOAD_MAX_FILE_SIZE : 4,

	TWILIO_SID_NOTIFIER : 'AC4ab9d3a6507c338fe6a0dccb5de82ba0',
	TWILIO_TOKEN_NOTIFIER : '6ca5aa2c6dfceb6488062165229c53a7',
	TWILIO_SECRET_NOTIFIER : 'i9ipUE8liPuM73uRhP1a5O2sXhkVh84H',

	// Control debug level for modules using visionmedia/debug
	DEBUG: '  '
};

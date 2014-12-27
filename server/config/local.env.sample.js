'use strict';

// Use local.env.js for environment variables that grunt will set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

module.exports = {
  DOMAIN:           'http://localhost:9000',
  SESSION_SECRET:   'nglungefullstack2-secret',

	FACEBOOK_ID: '302242913297749',
	FACEBOOK_SECRET: '53e129b591e6d8e4acd63441beb22f1f',

	LINKEDIN_ID : '78c2key7ro837d',
	LINKEDIN_SECRET : 'kVEtYfQ3CrX7cBef',

  TWITTER_ID:       'Lunge-no-app-id-set',
  TWITTER_SECRET:   'secret',

  GOOGLE_ID:        'Lunge-no-app-id-set',
  GOOGLE_SECRET:    'secret',

  // Control debug level for modules using visionmedia/debug
  DEBUG: ''
};

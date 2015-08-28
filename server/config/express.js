'use strict';

var express = require('express');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var path = require('path');
var config = require('./environment');
var passport = require('passport');
var session = require('express-session');

var mongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');

module.exports = function(express_web, app) {
	var env = express_web.get('env');
	express_web.set('views', config.root + '/server/views');
	express_web.engine('html', require('ejs').renderFile);
	express_web.set('view engine', 'html');
	express_web.use(compression());
	express_web.use(bodyParser.urlencoded({ extended: false }));
	express_web.use(bodyParser.json());
	express_web.use(methodOverride());
	express_web.use(cookieParser());
	express_web.use(passport.initialize());

	// Persist sessions with mongoStore
	// We need to enable sessions for passport twitter because its an oauth 1.0 strategy

	express_web.use(session({
		secret: config.secrets.session,
		resave: true,
		saveUninitialized: true,
		store: new mongoStore({ mongoose_connection: app.connections.db })
	}));


	if ('production' === env) {
		express_web.use(favicon(path.join(config.root, 'public', 'favicon.ico')));
		express_web.use(express.static(path.join(config.root, 'public')));
		express_web.set('appPath', config.root + '/public');
		express_web.use(morgan('dev'));
	}

	if ('development' === env || 'test' === env) {
		express_web.use(require('connect-livereload')());
		express_web.use(express.static(path.join(config.root, '.tmp')));
		express_web.use(express.static(path.join(config.root, 'client')));
		express_web.set('appPath', 'client');
		express_web.use(morgan('dev'));
		//express_web.use(errorHandler()); // Error handler - has to be last
	}
};
var express = require('express');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var path = require('path');
var morgan = require('morgan');
var errorHandler = require('errorhandler');
var config = require("../../config/environment");
var compression = require('compression');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var session = require('express-session');
var ConnectRedis = require("connect-redis");

var mongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');
module.exports = function setup(options, imports, register) {

	var web = express();
	var env = web.get('env');
	if ('production' === env) {
		web.use(favicon(path.join(config.root, 'public', 'favicon.ico')));
		web.use(express.static(path.join(config.root, 'public')));
		web.set('appPath', config.root + '/public');
		web.use(morgan('dev'));
	}

	if ('development' === env || 'test' === env) {
		web.use(express.static(path.join(config.root, '.tmp')));
		web.use(express.static(path.join(config.root, 'client')));
		web.set('appPath', 'client');
		web.use(morgan('dev'));
		web.use(errorHandler()); // Error handler - has to be last
	}
	//web.use(require('prerender-node').set('prerenderToken', 'gzjdwTTaxq127132SXOw'));
	//require("../../../config/routes")(web);
	var expressConfig = {
		configExpress : function(app) {
			require('../../../config/express')(web, app);
		},
		configOldRoutes : function(app) {
			require('../../../routes')(web, app, imports);
		},
		configNewRoutes : function() {
			return web;
		}
	};

	function wwwRedirect(req, res, next) {
		if (req.headers.host.slice(0, 4) === 'www.') {
			var newHost = req.headers.host.slice(4);
			return res.redirect(req.protocol + '://' + newHost + req.originalUrl);
		}
		next();
	};
	// FORCE 200 RESPONSES DURING DEVELOPMENT
	function force200Responses(req, res, next) {
		req.headers['if-none-match'] = 'no-match-for-this';
		next();
	}

	//if(process.env.NODE_ENV == "development")
	//	web.use(force200Responses);
	web.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
	web.use(bodyParser.json({limit: '50mb'}));
	web.set('views', config.root + '/server/views');
	web.engine('html', require('ejs').renderFile);
	web.set('view engine', 'html');
	web.use(compression());
	web.use(methodOverride());
	web.use(cookieParser());
	console.log("Dirname plus uploads = " + path.join(config.root, 'server/uploads'));
	web.use('/server/uploads', express.static(path.join(config.root, 'server/uploads')));
	//web.use(express.static(path.join(config.root, 'public')));
	web.use(passport.initialize());
	busboy = require('connect-busboy');
	web.use(busboy());
	web.use(bodyParser.json());
	web.set('trust proxy', true);
	web.use(wwwRedirect);

	web.use(require('connect-livereload')());
	// attach redis sessions to the requests, etc.
	var session = require('express-session');
	var RedisStore = ConnectRedis(session);
	var store = new RedisStore({
		client : imports.redis
	});
	web.use(session({
		secret : config.secrets.session,
		maxAge : new Date(Date.now() + 7200000), // 2 hr session lifetime
		store : store
	}));

	register(null, {
		express : web,
		expressConfig : expressConfig
	})
};
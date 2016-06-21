var http = require("http");
//var web = require("../../../web");
//var logger = require("../../../components/logger")();
EventEmitter = require('events').EventEmitter;
var _ = require("lodash");

var express = require('express');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var path = require('path');
var config = require('../../../config/environment');
var passport = require('passport');
var session = require('express-session');

var mongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');

module.exports = function setup(options, imports, register) {
	var config = options.config;

	function App(config) {
		this.config = config;
	}

	App.prototype = Object.create(EventEmitter.prototype);

	var instance = new App(config);
	_.merge(instance, imports.models);

	if(config.handleServer) {
		console.log("\n ---- app.js handleServer true ----\n");
		imports.routes.attach();
	}
	register(null, {
		app : instance
	});
};
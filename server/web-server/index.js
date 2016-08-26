var express = require('express');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var path = require('path');

module.exports = function Web(app, config) {
	var web = express();
	process.exit();
	require("../config/routes")(web);
	require('../config/express')(web, app);
	require('../routes')(web, app);
	return web;
};
module.exports = function setup(options, imports, register) {
	var _ = require("lodash"),
		moment = require("moment"),
		crypto = require("crypto"),
		//config = require("../../config/environment"),
		winston = require('winston')
		;

	winston.loggers.add('primeline2', {
		transports : [
			new winston.transports.Console({
				name : 'primeline2',
				level : 'info',
				colorize : true,
				label : 'primeline',
				prettyPrint : false
			})
		]
	});
	winston.loggers.add('info', {
		transports : [
			new winston.transports.Console({
				name : 'info',
				level : 'info',
				colorize : true,
				label : 'info',
				prettyPrint : false
			})
		]
	});
	winston.loggers.add('warning', {
		transports : [
			new winston.transports.Console({
				name : 'warning',
				level : 'warn',
				colorize : true,
				label : 'warning',
				prettyPrint : true
			})
		]
	});
	winston.loggers.add('model', {
		transports : [
			new winston.transports.Console({
				name : 'model',
				level : 'info',
				colorize : true,
				label : 'model',
				prettyPrint : false
			})
		]
	});
	winston.loggers.add('primelineActivity', {
		transports : [
			new winston.transports.Console({
				name : 'primelineActivity',
				level : 'info',
				colorize : true,
				label : 'primelineActivity',
				prettyPrint : false
			})
		]
	});
	winston.loggers.add('jobs', {
		transports : [
			new winston.transports.Console({
				name : 'jobs',
				level : 'info',
				colorize : true,
				label : 'jobs',
				prettyPrint : false
			})
		]
	});
	winston.loggers.add('clock', {
		transports : [
			new winston.transports.Console({
				name : 'clock',
				level : 'info',
				colorize : true,
				label : 'clock',
				prettyPrint : false
			})
		]
	});
	winston.loggers.add('emailSearchResults', {
		transports : [
			new winston.transports.Console({
				name : 'emailSearchResults',
				level : 'info',
				colorize : true,
				label : 'emailSearchResults',
				prettyPrint : false
			})
		]
	});


	loggerHelper = {
		addLoggerLabel : function(name, opt_label) {
			logger[name].log = function(){
				var args = arguments;
				if(args[1]) {
					args[1].logger = opt_label ? opt_label : name;
				}
				winston.Logger.prototype.log.apply(this,args);
			}
		}
	};

	var logger = {};

	var winstonLoggers = winston.loggers;
	winston.loggers.loggers.primeline = winston.loggers.get('primeline2');

	// get all loggers and attach them to the modules logger object
	Object.keys(winstonLoggers.loggers).forEach(function(key) {
		var val = winstonLoggers.loggers[key];
		logger[key] = winston.loggers.get(key)
	});

	// add the key of the logger to the output so i know where this came from
	Object.keys(logger).forEach(function(key) {
		var val = logger[key];
		loggerHelper.addLoggerLabel(key);
	});

	register(null, {
		logger : logger
	})

}
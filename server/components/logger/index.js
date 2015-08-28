//var winston = require('winston');
/*
 var log = bunyan.createLogger(
 {
 name: 'Apartminty',
 streams : [
 {
 stream : formatOut
 },
 {
 type : 'rotating-file',
 count : 10, //default
 path : './logs/info.log',
 level : 'info'
 },
 {
 type : 'rotating-file',
 count : 10, //default
 path : './logs/warn.log',
 level : 'warn'
 }
 ],
 //stream: formatOut,
 level: 'info'
 }
 );
 */



var winston = require('winston');

var logger;

var createLogger = function() {
	//return console;
	//console.log("logger is:", logger);
	if(logger)
		return logger;

	/*
	 var logger = new (winston.Logger)({
	 transports: [
	 new winston.transports.Console(
	 {
	 level: 'debug',
	 colorize: true,
	 timestamp: true,
	 handleExceptions: true,
	 prettyPrint : true
	 }),
	 new winston.transports.File(
	 {
	 level: 'info',
	 colorize: false,
	 timestamp: true,
	 json: true,
	 filename: '/var/log/mylog.log',
	 handleExceptions: true
	 })
	 ]
	 });
	 */
	logger = new (winston.Logger)({
		levels: {
			trace: 0,
			input: 1,
			verbose: 2,
			prompt: 3,
			debug: 4,
			info: 5,
			data: 6,
			help: 7,
			warn: 8,
			error: 9
		},
		colors: {
			trace: 'magenta',
			input: 'cyan',
			verbose: 'cyan',
			prompt: 'grey',
			debug: 'blue',
			info: 'green',
			data: 'grey',
			help: 'cyan',
			warn: 'yellow',
			error: 'red'
		},
		transports: [
			/*
			 new winston.transports.File({
			 name: 'infoLogs',
			 level: 'info',
			 filename: './logs/info/info.log',
			 json: true,
			 maxsize: 5242880, //5MB
			 maxFiles: 15,
			 colorize: false
			 }),
			 new winston.transports.File({
			 name : 'errorLogs',
			 level: 'error',
			 filename: './logs/error/error.log',
			 handleExceptions: false,
			 json: true,
			 maxsize: 5242880, //5MB
			 maxFiles: 15,
			 colorize: false
			 }),
			 new winston.transports.Console({
			 name : 'infoConsole',
			 level: 'info',
			 json: false,
			 prettyPrint : true,
			 colorize: true
			 }),
			 new winston.transports.Console({
			 name : 'errorConsole',
			 level: 'error',
			 handleExceptions: true,
			 json: false,
			 prettyPrint : true,
			 colorize: true
			 })
			 */
			/*
			 new winston.transports.File({
			 name : 'exceptionsLog',
			 level : 'fatal',
			 filename : './logs/exceptions/exceptions.log',
			 handleExceptions : true,
			 prettyPrint : true,
			 colorize: true
			 }),
			 */
			new winston.transports.Console({
				name : 'verboseConsole',
				level : 'verbose',
				prettyPrint : true,
				colorize: true
			}),

			new winston.transports.Console({
				name : 'errorConsole',
				level : 'error',
				prettyPrint : true,
				colorize: true
			})


		]
		//exitOnError: false
	});

	winston.loggers.add('exceptions', {
		console : {
			name : 'fatalExceptionsConsole',
			level : 'error',
			colorize : true,
			handleExceptions : true,
			label : 'exceptions',
			prettyPrint : true
		},
		file : {
			name : 'fatalExceptionsLog',
			maxsize: 5242880, //5MB
			maxFiles: 15,
			label : 'exceptions',
			handleExceptions : true,
			filename : './logs/exceptions/fatalExceptions.log'
		}
	});

	winston.loggers.add('emailSending', {
		transports : [
			new winston.transports.File({
				name : 'emailFatalExceptionsLog',
				level : 'error',
				maxsize: 5242880, //5MB
				maxFiles: 15,
				label : 'emailExceptions',
				filename : './logs/exceptions/emailFatalExceptions.log'
			}),
			new winston.transports.Console({
				name : 'emailExceptionsConsole',
				level : 'error',
				colorize : true,
				label : 'emailExceptions',
				prettyPrint : true
			}),
			new winston.transports.Console({
				name : 'emailInfoConsole',
				level : 'info',
				colorize : true,
				label : 'emailInfo',
				prettyPrint : true
			})
		]
	});
	//logger.handleExceptions(new winston.transports.Console());

	return logger;
}
module.exports = createLogger;
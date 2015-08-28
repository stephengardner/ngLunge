// make sure there is a NODE_ENV var
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var logger = require('./components/logger')();
var cpus = require('os').cpus().length;
var http = require('http');
var throng = require('throng');
var config = require('./config/environment');
var app = require('./app/index.js'); // I don't know why but this is requiring the full pathname to index.js
var web = require('./web-server');
//require('longjohn');

http.globalAgent.maxSockets = Infinity;

// spin up our workers...? ok
throng(start, { workers: config.max_concurrency ? config.max_concurrency : 1 });

var instance;

function start() {
	logger.info({
		type: 'info',
		msg: 'starting server',
		concurrency: config.concurrency,
		thrifty: config.thrifty,
		timeout: config.timeout,
		busy_ms: config.busy_ms
	});
	instance = app(config);
	instance.once('ready', function(){
		var server = http.createServer(web(instance), config);
		instance
			.removeListener('lost', abort)
			.on('lost', shutdown);
		server.listen(config.port, config.ip, onListen);
		function onListen() {
			console.log("onListen...");
			//logger.info({ type: 'info', msg: 'listening', port: server.address().port });
			configSocketIO();
		}
		function configSocketIO() {
			// set up socketio now that the server has been created
			var socketio = require('socket.io')(server, {
				serveClient: (config.env === 'production') ? false : true
				, path: '/socket.io-client',
				transports : ['websocket']  // On PAAS ( Heroku ) we can only use the websocket transport
			});
			instance.socketio = socketio;
			require('./config/socketio')(instance);
		}
		function shutdown() {
			console.log("Shutdown...");
			logger.log({ type: 'info', msg: 'shutting down' });
			server.close(function() {
				logger.log({ type: 'info', msg: 'exiting' });
				process.exit();
			});
		}
	});
	instance.once('lost', abort)
	//instance.on('ready', createServer);
	//instance.on('lost', abort);

	/*
	function createServer() {
		logger.info("Lunge: createServer()");
		process.on('SIGTERM', shutdown);
		var server = http.createServer(web(instance), config)
			//.listen(config.port, config.ip, onListen);
		instance.removeAllListeners('ready');
		instance
			.removeListener('lost', abort)
			.on('lost', shutdown);

		server.listen(config.port, config.ip, onListen);

		function onListen() {
			console.log("onListen...");
			logger.info({ type: 'info', msg: 'listening', port: server.address().port });
			//configSocketIO();
		}

		function configSocketIO() {
			// set up socketio now that the server has been created
			var socketio = require('socket.io')(server, {
				serveClient: (config.env === 'production') ? false : true
				, path: '/socket.io-client',
				transports : ['websocket']  // On PAAS ( Heroku ) we can only use the websocket transport
			});
			instance.socketio = socketio;
			require('./config/socketio')(instance);
		}

		function shutdown() {
			console.log("Shutdown...");
			logger.log({ type: 'info', msg: 'shutting down' });
			server.close(function() {
				logger.log({ type: 'info', msg: 'exiting' });
				process.exit();
			});
		}
	}
	*/

	function abort() {
		console.log("Lunge abort()");
		logger.log({ type: 'info', msg: 'shutting down', abort: true });
		process.exit();
	}
}


function onError(err) {
	logger.error(err);
}
function onSuccess() {}
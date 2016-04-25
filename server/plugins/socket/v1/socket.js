var socketioJwt = require('socketio-jwt');
var logger = require("../../../components/logger")();
var config = require("../../../config/environment");
var redis = require("redis");
var ioredis = require('socket.io-redis');

module.exports = function setup(options, imports, register){
	var server = imports.server;
	var config = options.config;

	// url parses this specific url, creates many params, including "auth" which is the built-in password on this url
	var	redisParams   = require("url").parse(config.redis.redisToGoURL);
	var port = redisParams.port;
	var hostname = redisParams.hostname;
	var pass = redisParams.auth.split(":")[1];

	// create the pub/sub using redis clients.  This works.  return_buffers must be set to true according to the docs
	var pub = redis.createClient(port, hostname, {auth_pass : pass, return_buffers : true});
	var sub = redis.createClient(port, hostname, {auth_pass : pass, return_buffers : true});

	var io = require('socket.io')(server, {
		serveClient: (config.env === 'production') ? false : true
		, path: '/socket.io-client',
		transports : ['websocket']  // On PAAS ( Heroku ) we can only use the websocket transport
	});

	// This can console.log on every message that the pub/sub receives.
	sub.on("message", function(){})
	pub.on("message", function(){})

	// This works, it works well, I needed to update socket.io and redis for it to work propertly
	io.adapter(ioredis(
		{
			pubClient: pub,
			subClient: sub
		}
	));

	// This works. An ioemitter from an "outside" source.  It will emit to the CLIENT, not to other server processes.
	//var ioemitterRedis = require("redis").createClient(port, hostname, {return_buffers : true});
	//ioemitterRedis.auth(pass);
	//var ioemitter = require("socket.io-emitter")(ioemitterRedis);
	//var ioemitterNamespace = ioemitter.of('/');
	//setInterval(function(){
	//	console.log("Emitting ioemitter time event");
	//	ioemitterNamespace.broadcast.emit('time', new Date());
	//}, 2000);

	var defaultNamespace = io.of('/');
	defaultNamespace.on('connection', function(socket){
		console.log("-> A new socket has connected");
	});

	// todo maybe test this works by publishing a logout message when it's not authenticated?
	io.use(socketioJwt.authorize({
		secret: config.secrets.session,
		handshake: true,
		required : false,
		// Added this method which works for optional authentication, actually.
		// It basically will just call the onConnection even when the handshake fails, which we want.
		fail: function (error, data, accept) {
			console.log("The socket was not connected with authentication");
			if (data.request) {
				accept(null);
			} else {
				accept(null, false);
			}
		}
	}));

	register(null, {
			socket : io
		}
	);
}
/**
 * Socket.io configuration
 */

'use strict';

var config = require('../environment');
var cookieParser = require('cookie-parser');

var jwt = require('jsonwebtoken');
module.exports = function (app) {
	var TrainerSocketEvents = require('../../app/models/trainer/socket/index.js')(app);
	app.sockets = {};
	var io = app.socketio;
	// socket.io (v1.x.x) is powered by debug.
	// In order to see all the debug output, set DEBUG (in server/config/local.env.js) to including the desired scope.
	//
	// ex: DEBUG: "http*,socket.io:socket"

	// We can authenticate socket.io users and access their token through socket.handshake.decoded_token
	//
	// 1. You will need to send the token in `client/components/socket/socket.service.js`
	//
	// 2. Require authentication here:
	var socketioJwt = require('socketio-jwt');
	io.use(socketioJwt.authorize({
		secret: config.secrets.session,
		handshake: true,
		required : false
	}));
	var defaultNamespace = io.of('/');
	defaultNamespace.on('connection', function(socket){
		console.log("\n***************************on(connection)***************************")
		onConnect(socket);
		socket.on('disconnect', function(data){
			onDisconnect(socket);
		});
		socket.on("custom-authenticate", function(data) {
			setTimeout(function(){
				onAuthenticateAsync(socket, data);
			},1000);
		});
		socket.on('joinRoom', function(room) {
			console.log("A socket is joining:", room);
			socket.join(room);
		});
	}).on('authenticated', function(socket) {
		console.log("---\n---\n---\nSocket Authenticated\n---\n---\n---");
		//this socket is authenticated, we are good to handle more events from it.
		//console.log('-----------------\nhello! ' + socket.decoded_token + '\n-----------------\n');
	});

	// When the user disconnects.. perform this
	function onDisconnect(socket) {
		console.log("Socket DISconnected with decoded token: ", socket.decoded_token);
		//console.info('SocketIO: [%s] DISCONNECTED', socket.address);
		//console.log("This socket is in rooms : ", socket.rooms);
	}

	// When the user connects.. perform this
	function onConnect(socket) {
		// When the client emits 'info', this listens and executes
		socket.on('info', function (data) {
			console.info('[%s] %s', socket.address, JSON.stringify(data, null, 2));
		});

		// Insert sockets below
		TrainerSocketEvents.register(socket);
	}

	function onAuthenticateAsync(socket, data) {
		console.log("---\n---\nnew socket attempting to authenticate\n---\n---\n---");
		if(data.token) {
			jwt.verify(data.token, config.secrets.session, function(err, decoded) {
				if(err) throw err;
				if(decoded) {
					console.log("**\nSocket Authenticated\n**")
					console.log(decoded);
					socket.decoded_token = decoded;
					console.log("APP IS:",app);
					app.sockets[decoded._id] = socket;
				}
			});
		}
		else {
			console.log("-\nNo socket token sent\n-");
		}
	}
};
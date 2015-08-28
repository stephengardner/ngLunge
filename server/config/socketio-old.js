/**
 * Socket.io configuration
 */

'use strict';

var config = require('./environment');
var cookieParser = require('cookie-parser');
var Trainer = require("../api/trainer/trainer.model");
var app = require('../app');


Trainer.schema.post('save', function (doc) {

	// emit to all sockets that are on in the room for this trainer, currently they enter the room when they're on the profile page
	app.io.sockets.in('trainer:' + doc._id).emit("trainer:" + doc._id + ":updated", doc);


	console.log("\nPING! Trainer Updated, \nEmmitting: trainer:" + doc._id + ":updated" + " to all registered sockets in that room!\n");
});

// When the user disconnects.. perform this
function onDisconnect(socket) {
	//console.log("Socket DISconnected with decoded token: ", socket.decoded_token);
	//console.info('SocketIO: [%s] DISCONNECTED', socket.address);
	//console.log("This socket is in rooms : ", socket.rooms);
}

// When the user connects.. perform this
function onConnect(socket) {
	//console.log("socket.decoded_token: ", socket.decoded_token);
	// When the client emits 'info', this listens and executes
	socket.on('info', function (data) {
		console.info('[%s] %s', socket.address, JSON.stringify(data, null, 2));
	});

	// Insert sockets below
	require('../api/thing/thing.socket').register(socket);
	require('../api/trainer/trainer.socket').register(socket);
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
var jwt = require('jsonwebtoken');
module.exports = function (io, server) {
	// socket.io (v1.x.x) is powered by debug.
	// In order to see all the debug output, set DEBUG (in server/config/local.env.js) to including the desired scope.
	//
	// ex: DEBUG: "http*,socket.io:socket"

	// We can authenticate socket.io users and access their token through socket.handshake.decoded_token
	//
	// 1. You will need to send the token in `client/components/socket/socket.service.js`
	//
	// 2. Require authentication here:
	app.io = io;
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














	/*
	socketio.on('connection', function (socket) {
		socket.address = socket.handshake.address !== null ?
			socket.handshake.address.address + ':' + socket.handshake.address.port :
			process.env.DOMAIN;

		socket.connectedAt = new Date();

		// Call onDisconnect.
		socket.on('disconnect', function () {
			onDisconnect(socket);
		});

		// Call onConnect.
		onConnect(socket);

	});
	*/






	/*
	//With Socket.io >= 1.0
	socketio.use(passportSocketIo.authorize({
		cookieParser: cookieParser,
		key:         'connect.sid',       // the name of the cookie where express/connect stores its session_id
		secret:      config.secrets.session,    // the session_secret to parse the cookie
		store:       sessionStore,        // we NEED to use a sessionstore. no memorystore please
		success:     onAuthorizeSuccess,  // *optional* callback on success - read more below
		fail:        onAuthorizeFail     // *optional* callback on fail/error - read more below
	}));
*/
	// With Socket.io < 1.0
	/*
	socketio.set('authorization', passportSocketIo.authorize({
		cookieParser: cookieParser,
		key:         'connect.sid',       // the name of the cookie where express/connect stores its session_id
		secret:      config.secrets.session,    // the session_secret to parse the cookie
		store:       sessionStore,        // we NEED to use a sessionstore. no memorystore please
		success:     onAuthorizeSuccess,  // *optional* callback on success - read more below
		fail:        onAuthorizeFail     // *optional* callback on fail/error - read more below
	}));
	function onAuthorizeSuccess(data, accept){
		console.log('successful connection to socket.io');

		// The accept-callback still allows us to decide whether to
		// accept the connection or not.
		accept(null, true);

		// OR

		// If you use socket.io@1.X the callback looks different
		accept();
	}

	function onAuthorizeFail(data, message, error, accept){
		console.log("USER:", sessionStore.user);
		if(error)
			throw new Error(message);
		console.log('failed connection to socket.io:', message);

		// We use this callback to log all of our failed connections.
		accept(null, false);

		// OR

		// If you use socket.io@1.X the callback looks different
		// If you don't want to accept the connection
		if(error)
			accept(new Error(message));
		// this error will be sent to the user as a special error-package
		// see: http://socket.io/docs/client-api/#socket > error-object
	}
	*/
};
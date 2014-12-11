/**
 * Socket.io configuration
 */

'use strict';

var config = require('./environment');
var cookieParser = require('cookie-parser');
//var passportSocketIo = require('passport.socketio');

// When the user disconnects.. perform this
function onDisconnect(socket) {
	console.log("Socket DISconnected with decoded token: ", socket.decoded_token);
	console.info('SocketIO: [%s] DISCONNECTED', socket.address);
}

// When the user connects.. perform this
function onConnect(socket) {
	console.log("socket.decoded_token: ", socket.decoded_token);
	// When the client emits 'info', this listens and executes
	socket.on('info', function (data) {
		console.info('[%s] %s', socket.address, JSON.stringify(data, null, 2));
	});

	// Insert sockets below
	require('../api/thing/thing.socket').register(socket);
	require('../api/trainer/trainer.socket').register(socket);
}

module.exports = function (socketio, sessionStore) {
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
	socketio.use(require('socketio-jwt').authorize({
		secret: config.secrets.session,
		handshake: true,
		required : false
	}));
	/*
	socketio.set('authorization', socketioJwt.authorize({
		secret: config.secrets.session,
		handshake: true,
		required : false,
		success : function(data, accept){
			console.log("AUTHORIZEDDDD");
		}, fail : function(error, data, accept){
			console.log("SOMETHING ELSE?");
		}
		})
	);
	*/


	socketio
		.on('connection', function(socket){
			console.log("CONNECTED!");
			console.log("ARE WE AUTHORIZED? ", socket.decoded_token);
			socket.on('doit', function(){
				console.log("FUICK");
			});
		}).on('authenticated', function(socket) {
			//this socket is authenticated, we are good to handle more events from it.
			console.log('hello! ' + socket.decoded_token.name);
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
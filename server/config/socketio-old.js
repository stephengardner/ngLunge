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
	console.log("[Socket] new Socket attempting to Authenticate");
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
		console.log("[Socket] Socket Authenticated");
	});
};
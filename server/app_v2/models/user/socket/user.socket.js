var jwt = require('jsonwebtoken');

module.exports = function setup(options, imports, register) {
	var exports = {},
		userModel = imports.userModel,
		trainerPopulatorCertificationsAggregated = imports.trainerPopulatorCertificationsAggregated,
		io = imports.socket,
		trainerModel = imports.trainerModel,
		traineeModel = imports.traineeModel,
		userPopulator = imports.userPopulator,
		config = options.config,
		logger = imports.logger.info,
		loggerType = 'user.socket',
		chatModel = imports.chatModel
		;

	function afterPopulating(response) {
		logger.info({type : loggerType,
			msg : "Emmitting: user:"
			+ response._id
			+ ":updated which means a specific user was updated now!"
		});
		// emit to all sockets that are on in the room for this trainer, currently they enter the room when they're
		// on the profile page
		io.to('user:' + response._id).emit("user:" + response._id + ":updated", response);
		// emit this to authenticated sockets so that it updates Auth.currentUser
		io.to('user:auth:' + response._id).emit("user:auth:updated", response);
	}
	function postSave(doc) {
		logger.info({ type : loggerType, msg : "postSave on user model (kind = " + doc.kind + ")"});
		if(doc.kind == 'trainer'){
			trainerPopulatorCertificationsAggregated.get(doc._id).then(function(response){
				afterPopulating(response);
			}).catch(function(err){
				console.log(err);
			})
		}
		else {
			userPopulator.populate(doc._id).then(function(response){
				afterPopulating(response);
			}).catch(function(err){
				console.log(err);
			})
		}
	}
	trainerModel.schema.post('save', function(doc){
		postSave(doc);
	});
	traineeModel.schema.post('save', function(doc){
		postSave(doc);
	});

	var defaultNamespace = io.of('/');
	defaultNamespace.on('connection', function(socket){
		console.log("//BEGIN socket.on(connection)");
		socket.on('time', function(time){
			console.log("SOCKET on time", time);
		})
		console.log("registering trainer socket events");
		socket.on('joinRoom', function(room) {
			console.log("A socket is joining:", room);
			socket.broadcast.emit('test', { hmmmm : 'hmmmm' });
			defaultNamespace.emit('test', { hmm2 : 'hmm2' });
			socket.join(room);
		});
		socket.on('leaveRoom', function(room) {
			console.log("A socket is leaving:", room);
			socket.leave(room);
		});
		socket.on("custom-authenticate", function(data) {
			console.log("CUSTOM-Authenticate");
			onAuthenticateAsync(socket, data);
		});
		socket.on('disconnect', function(data){
			onDisconnect(socket);
		});

		socket.on('joinChat', function(chatRoomId) {
			if(!socket.decoded_token || !socket.decoded_token._id) {
				logger.info({ type : loggerType, msg : 'Socket attempted to join chat '
				+ chatRoomId
				+ ' without first authenticatinge'});
				return;
			}
			chatModel.findOne({
				_id : chatRoomId,
				'participants.user' : socket.decoded_token._id
			}, function(err, found){
				if(err) {
					logger.error(err);
				}
				if(!found) {
					logger.info({ type : loggerType, msg : 'attempted to join chat id: ' + chatRoomId + ' for' +
					' user: ' + socket.decoded_token._id + ' and there was no chat available'});
				}
				if(found) {
					logger.info({ type : loggerType, msg : 'user ' + socket.decoded_token._id + ' is joining' +
					' chat room: ' + chatRoomId});
					socket.join('chat:' + chatRoomId);
					socket.emit('chat:' + chatRoomId + ':joined');
				}
			})
		});
		
		console.log("\\\\END socket.on(connection)");
	}).on('authenticated', function(socket){
		console.log("About to call registerAuthenticated");
		registerAuthenticated(socket);
	});

	function registerAuthenticated(socket) {
		console.log("\nRegistering socket authenticated events\n");
		console.log("Registerauthenticated for user id:", socket.decoded_token._id);
		var room = 'user:auth:' + socket.decoded_token._id;
		console.log("Joining room:", room);
		socket.join(room);

		console.log("Sockets rooms are :", socket.rooms);
		socket.on('login', function(user){
			console.log(user.name, "logging in");
			console.info('notifying [%s] of Login event', socket.address);
		});

		// Logout method
		socket.on('logout', function(user){
			console.log("user.socket.on('logout') for trainer id: ", user._id);
			var emittingMessage = "trainer:" + socket.decoded_token._id + ":logout";
			console.log("Emitting: user:auth:logout for those in room: user:auth:" + socket.decoded_token._id);
			console.log("Sockets rooms are :", socket.rooms);
			// this broadcasts a logout event to everyone EXCEPT the sender, which is good for us.
			// Since the person sending this event will already be logging out, that's fine.
			//socket.broadcast.to('trainer:' + socket.decoded_token._id).emit(emittingMessage);
			// Remove from the authenticated room.. Very important
			socket.leave(room);
			console.log("Afterwards Sockets rooms are :", socket.rooms);
			socket.broadcast.to('user:auth:' + socket.decoded_token._id).emit('user:auth:logout');
		})
	};

	// When the user disconnects.. perform this
	function onDisconnect(socket) {
		console.log("Socket DISconnected with decoded token: ", socket.decoded_token);
		if(socket.decoded_token) {
			/*
			 var _id = socket.decoded_token._id;
			 if(io.sockets[_id] && io.sockets[_id].length){
			 io.sockets[_id].splice(io.sockets[_id].indexOf(socket), 1);
			 if(!io.sockets[_id] || !io.sockets[_id].length) {
			 console.log("Number of sockets now registered for _id " + _id + " is : 0");
			 delete io.sockets[_id];
			 }
			 if(io.sockets[_id]) {
			 console.log("Number of sockets now registered for _id " + _id + " is : " + io.sockets[_id].length);
			 }
			 }
			 */
		}
	}
	function onAuthenticateAsync(socket, data) {
		console.log("---\n---\nnew socket attempting to authenticate\n---\n---\n---");
		socket.on('logout', function(){
			console.log("------------------------ I've received a logout message --------------------------");
			socket.disconnect();
		});
		if(data.token) {
			jwt.verify(data.token, config.secrets.session, function(err, decoded) {
				if(err) throw err;
				if(decoded) {
					console.log("**\nSocket Authenticated\n**")
					socket.decoded_token = decoded;

					userModel.findById(decoded._id, function(err, user){
						if(err) {

						}
						else {
							if(!user) {

							}
							socket.emit('user:authenticated', user);
							registerAuthenticated(socket);
						}
					})
					/*
					 if(!io.sockets[decoded._id] || !io.sockets[decoded._id].length) {
					 io.sockets[decoded._id] = [socket];
					 }
					 else {
					 io.sockets[decoded._id].push(socket);
					 }
					 */
				}
				else {
					socket.emit('unauth:connected');
					console.log("Socket not Authenticated");
				}
			});
		}
		else {
			console.log("-\nNo socket token sent\n-");
		}
	}
	register(null, {
		userSocket : {}
	})
}

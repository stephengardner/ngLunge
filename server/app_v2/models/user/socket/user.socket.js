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
				logger.error(err);
			})
		}
		else {
			userPopulator.populate(doc._id).then(function(response){
				afterPopulating(response);
			}).catch(function(err){
				logger.error(err);
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
		
		socket.on('joinRoom', function(room) {
			logger.info({type : loggerType, msg : "A socket is joining a room", room : room});
			socket.join(room);
		});
		
		socket.on('leaveRoom', function(room) {
			logger.info({type : loggerType, msg : "A socket is leaving a room", room : room});
			socket.leave(room);
		});
		
		socket.on("custom-authenticate", function(data) {
			onAuthenticateAsync(socket, data);
		});
		
		socket.on('disconnect', function(data){
			onDisconnect(socket);
		});

		socket.on('joinChat', function(chatRoomId) {
			if(!socket.decoded_token || !socket.decoded_token._id) {
				logger.info({ type : loggerType, msg : 'Socket attempted to join chat '
				+ chatRoomId
				+ ' without first authenticating'});
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

	}).on('authenticated', function(socket){
		registerAuthenticated(socket);
	});

	function registerAuthenticated(socket) {
		var userId;
		if(socket.decoded_token._id && socket.decoded_token._id._id) {
			userId = socket.decoded_token._id._id;
		}
		else {
			userId = socket.decoded_token._id;
		}
		if(!userId) {
			logger.error(new Error('No decoded token id on this authentication'));
		}
		var room = 'user:auth:' + userId;

		socket.join(room);

		socket.on('login', function(user){
			logger.info({type : loggerType, msg : "User logging in", user : user.name});
		});

		// Logout method
		socket.on('logout', function(user){
			logger.info({type : loggerType, msg : "User logging out", user : user.name});
			// this broadcasts a logout event to everyone EXCEPT the sender, which is good for us.
			// Since the person sending this event will already be logging out, that's fine.
			//socket.broadcast.to('trainer:' + socket.decoded_token._id).emit(emittingMessage);
			// Remove from the authenticated room.. Very important
			socket.loggedIn = undefined; // IMPORTANT.  My way of telling if they're logged in or not
			socket.leave(room);
			socket.broadcast.to('user:auth:' + socket.decoded_token._id).emit('user:auth:logout');
		})
	}

	// When the user disconnects.. perform this
	function onDisconnect(socket) {
		logger.info({ type : loggerType, msg : "Socket Disconnected"});
		if(socket.decoded_token) {
		}
	}

	function onAuthenticateAsync(socket, data) {
		socket.emit('testing');
		if(socket.loggedIn) {
			logger.info({
				type : loggerType,
				msg: 'onAuthenticateAsync() called but socket is already loggedIn, so return'
			});
			return;
		}
		logger.info({
			type : loggerType,
			msg: 'onAuthenticateAsync'
		});
		socket.on('logout', function(){
			var err = new Error();
			socket.disconnect();
		});
		if(data.token) {
			jwt.verify(data.token, config.secrets.session, function(err, decoded) {
				if(err) throw err;
				if(decoded) {
					socket.decoded_token = decoded;
					userModel.findById(decoded._id, function(err, user){
						if(err) {
							logger.error(err);
						}
						else {
							if(!user) {
							}
							if(socket.loggedIn) {
								logger.info({
									type : loggerType,
									msg: 'onAuthenticateAsync() called but socket is already loggedIn, so return'
								});
								return
							}
							socket.loggedIn = true;
							logger.info({
								type : loggerType,
								msg: 'onAuthenticateAsync() emitting user:authenticated',
								user : user._id.toString()
							});
							socket.emit('user:authenticated');
							registerAuthenticated(socket);
						}
					});
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
					logger.info({type : loggerType, msg : "Socket not Authenticated"});
				}
			});
		}
		else {
			logger.info({type : loggerType, msg : "No Socket Token Sent"});
		}
	}
	register(null, {
		userSocket : {}
	})
}

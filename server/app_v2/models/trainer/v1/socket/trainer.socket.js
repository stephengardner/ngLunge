var jwt = require('jsonwebtoken');

module.exports = function setup(options, imports, register) {
	var exports = {};
	var Trainer = imports.trainerModel;
	var models = imports.models;
	var certificationOrganizationModel = imports.certificationOrganizationModel;
	var io = imports.socket;
	var config = options.config;
	var trainerPopulatorCertificationsAggregated = imports.trainerPopulatorCertificationsAggregated;

	Trainer.schema.post('save', function (doc) {
		trainerPopulatorCertificationsAggregated.get(doc._id).then(function(response){
			console.log("Emmitting: trainer:" + doc._id + ":updated" + " which means a specific trainer was updated now!");
			// emit to all sockets that are on in the room for this trainer, currently they enter the room when they're on the profile page
			//console.log("Any sockets in here?: ", io.sockets.in('trainer:' + response._id));
			//console.log("all sockets in here are:", io.nsps['/'].adapter.rooms['trainer:' + response._id]);
			io.to('trainer:' + response._id).emit("trainer:" + response._id + ":updated", response);

		}).catch(function(err){

		})
		/*
		Trainer.findById(doc._id)
			.populate('specialties')
			.populate('certifications_v2.certification_type')
			.exec(function(err, newdoc){
				if(err) return console.log(err);
				certificationOrganizationModel
					.populate(newdoc,
					{path : 'certifications_v2.certification_type.organization', model : 'CertificationOrganization'},
					function(err, populatedTrainer){
						console.log("Emmitting: trainer:" + doc._id + ":updated" + " which means a specific trainer was updated now!");
						// emit to all sockets that are on in the room for this trainer, currently they enter the room when they're on the profile page
						io.sockets.in('trainer:' + newdoc._id).emit("trainer:" + newdoc._id + ":updated", populatedTrainer);
					});
			})
			*/
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
		console.log("\\\\END socket.on(connection)");
	}).on('authenticated', function(socket){
		console.log("About to call registerAuthenticated");
		registerAuthenticated(socket);
	});

	function registerAuthenticated(socket) {
		console.log("\nRegistering socket authenticated events\n");
		console.log("Registerauthenticated for user id:", socket.decoded_token._id);
		var room = 'trainer:auth:' + socket.decoded_token._id;
		console.log("Joining room:", room);
		socket.join(room);

		socket.on('login', function(trainer){
			console.log(trainer.name, "logging in");
			console.info('notifying [%s] of Login event', socket.address);
		});

		//socket.on('async-logout', function(trainer){
		//	console.log("-----------------> GOT AN ASYNC LOGOUT MESSAGE");
		//	var emittingMessage = "trainer:" + trainer._id + ":logout";
		//	socket.broadcast.to('trainer:' + trainer._id).emit(emittingMessage, trainer);
		//});
		/*
		socket.on('fakelogout', function(trainer){
			console.log("fakelogout", trainer._id);
			//console.log("-----------------> GOT AN ASYNC LOGOUT MESSAGE");
			var emittingMessage = "trainer:" + trainer._id + ":logout";
			socket.broadcast.to('trainer:' + trainer._id).emit(emittingMessage, trainer);
		});
		*/
		// Logout method
		socket.on('logout', function(trainer){
			console.log("trainer.socket.on('logout') for trainer id: ", trainer._id);
			var emittingMessage = "trainer:" + socket.decoded_token._id + ":logout";
			console.log("Emitting: trainer:auth:logout for those in room: trainer:auth:" + socket.decoded_token._id);
			// this broadcasts a logout event to everyone EXCEPT the sender, which is good for us.
			// Since the person sending this event will already be logging out, that's fine.
			//socket.broadcast.to('trainer:' + socket.decoded_token._id).emit(emittingMessage);
			socket.broadcast.to('trainer:auth:' + socket.decoded_token._id).emit('trainer:auth:logout');
			//socket.disconnect();
			//var logoutRoom = 'trainer:loggedIn:' + trainer._id;
			//console.log("Emitting to those in room: ", logoutRoom);
			//socket.broadcast.to(logoutRoom).emit('async-logout', trainer);
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
		//app.sockets[socket.decoded_token]
		//console.info('SocketIO: [%s] DISCONNECTED', socket.address);
		//console.log("This socket is in rooms : ", socket.rooms);
	}
	function onAuthenticateAsync(socket, data) {
		console.log("---\n---\nnew socket attempting to authenticate\n---\n---\n---");
		socket.on('logout', function(){
			console.log("------------------------ I've received a logout message --------------------------");
			socket.disconnect();
		})
		if(data.token) {
			jwt.verify(data.token, config.secrets.session, function(err, decoded) {
				if(err) throw err;
				if(decoded) {
					console.log("**\nSocket Authenticated\n**")
					//console.log(decoded);
					socket.decoded_token = decoded;
					//console.log("APP IS:",app);
					Trainer.findById(decoded._id, function(err, trainer){
						socket.emit('trainer:authenticated', trainer);
						registerAuthenticated(socket);
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
					console.log("Socket not Authenticated");
				}
			});
		}
		else {
			console.log("-\nNo socket token sent\n-");
		}
	}
	register(null, {
		trainerSocket : {}
	})
	//console.log("Socket isssssssssssssssssss:", io);
	/*
	 var defaultNamespace = io.of('/');
	 defaultNamespace.on('connection', function(socket){
	 console.log("\n***************************on(connection)***************************")
	 onConnect(socket);
	 socket.on('disconnect', function(data){
	 onDisconnect(socket);
	 });

	 // todo figure out what this does
	 socket.on("custom-authenticate", function(data) {
	 console.log("CUSTOM-Authenticate");
	 setTimeout(function(){
	 onAuthenticateAsync(socket, data);
	 },1000);
	 });
	 socket.on('joinRoom', function(room) {
	 console.log("A socket is joining:", room);
	 socket.join(room);
	 });
	 socket.on('leaveRoom', function(room) {
	 console.log("A socket is leaving:", room);
	 socket.leave(room);
	 });
	 }).on('authenticated', function(socket) {
	 console.log("---\n---\n---\nSocket Authenticated\n---\n---\n---");
	 //TrainerSocketEvents.registerAuthenticated(socket);
	 //this socket is authenticated, we are good to handle more events from it.

	 //console.log('-----------------\nhello! ' + socket.decoded_token + '\n-----------------\n');
	 });
	 register(null, {
	 trainerSocket : {}
	 })





	 // When the user disconnects.. perform this
	 function onDisconnect(socket) {
	 console.log("Socket DISconnected with decoded token: ", socket.decoded_token);
	 var _id = socket.decoded_token._id;
	 if(io.sockets[_id] && io.sockets[_id].length){
	 io.sockets[_id].splice(io.sockets[_id].indexOf(socket), 1);
	 if(!io.sockets[_id] || !io.sockets[_id].length) {
	 delete app.sockets[_id];
	 }
	 console.log("App sockets is now:", io.sockets);
	 }
	 //app.sockets[socket.decoded_token]
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
	 //TrainerSocketEvents.register(socket);
	 //CertificationTypeSocketEvents.register(socket);
	 //CertificationOrganizationSocketEvents.register(socket);
	 }

	 function onAuthenticateAsync(socket, data) {
	 console.log("---\n---\nnew socket attempting to authenticate\n---\n---\n---");
	 if(data.token) {
	 jwt.verify(data.token, config.secrets.session, function(err, decoded) {
	 if(err) throw err;
	 if(decoded) {
	 console.log("**\nSocket Authenticated\n**")
	 //console.log(decoded);
	 socket.decoded_token = decoded;
	 //console.log("APP IS:",app);
	 models.Trainer.findById(decoded._id, function(err, trainer){
	 socket.emit('trainer:authenticated', trainer);
	 //TrainerSocketEvents.registerAuthenticated(socket);
	 })
	 if(!io.sockets[decoded._id] || !io.sockets[decoded._id].length) {
	 io.sockets[decoded._id] = [socket];
	 }
	 else {
	 io.sockets[decoded._id].push(socket);
	 }
	 }
	 else {
	 console.log("Socket not Authenticated");
	 }
	 });
	 }
	 else {
	 console.log("-\nNo socket token sent\n-");
	 }
	 }
	 */
}

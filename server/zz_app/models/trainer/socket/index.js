module.exports = function(app) {
	var exports = {};
	var Trainer = app.models.Trainer;

	Trainer.schema.post('save', function (doc) {
		Trainer.findById(doc._id)
			.populate('specialties')
			.populate('certifications_v2')
			.exec(function(err, newdoc){
			if(err) return console.log(err);
				app.models.CertificationOrganization
					.populate(newdoc,
					{path : 'certifications_v2.organization', model : 'CertificationOrganization'},
					function(err, populatedTrainer){
						console.log("Emmitting: trainer:" + doc._id + ":updated" + " which means a specific trainer was updated now!");
						// emit to all sockets that are on in the room for this trainer, currently they enter the room when they're on the profile page
						app.socketio.sockets.in('trainer:' + newdoc._id).emit("trainer:" + newdoc._id + ":updated", populatedTrainer);

						// We set the global sockets when the sockets connected/authenticated.
						// We stored each open socket in an object, the key is the decoded ._id and the array
						// is all the sockets that are logged in on that user.
						// So here we emit to all of those sockets indiviudally. Ta-da.
						if(app.sockets[populatedTrainer._id] && app.sockets[populatedTrainer._id].length) {
							for(var i = 0; i < app.sockets[populatedTrainer._id].length; i++){
								app.sockets[populatedTrainer._id][i].emit('trainer:auth:updated', populatedTrainer);
							}
						}
					});
		})
	});

	exports.registerAuthenticated = function(socket) {
		console.log("\nRegistering socket authenticated events\n");
		socket.on('login', function(trainer){
			console.log(trainer.name, "logging in");
			console.info('notifying [%s] of Login event', socket.address);
		});

		// Logout method
		socket.on('logout', function(trainer){
			console.log("LOGGING OUT???!?!?!?!", trainer._id);
			var emittingMessage = "trainer:" + trainer._id + ":logout";
			console.log("Emitting:", emittingMessage);
			// this broadcasts a logout event to everyone EXCEPT the sender, which is good for us.
			// Since the person sending this event will already be logging out, that's fine.
			socket.broadcast.to('trainer:' + trainer._id).emit(emittingMessage, trainer);
		})
	};
	exports.register = function(socket) {

		socket.on('updated', function(trainer){
			console.log("U.P.D.A.T.E.D.");
			//console.info(trainer.name + " has emitted an update event");
		});

		Trainer.schema.post('remove', function (doc) {
			console.info('notifying [%s] of Remove event', socket.address);
			onRemove(socket, doc);
		});

	}

	function onSave(socket, doc, cb) {
		// emit a global trainer save event (may want to remove this later augie!)
		socket.emit('trainer:save', doc);
	}

	function onRemove(socket, doc, cb) {
		socket.emit('trainer:remove', doc);
	}

	return exports;

}
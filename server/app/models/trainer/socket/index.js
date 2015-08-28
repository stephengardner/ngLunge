module.exports = function(app) {
	var exports = {};
	var Trainer = app.models.Trainer;

	Trainer.schema.post('save', function (doc) {
		Trainer.findById(doc._id).populate('specialties').exec(function(err, newdoc){
			if(err) return console.log(err);
			console.log("Emmitting: trainer" + doc._id + ":updated" + " which means a specific trainer was updated now!");
			// emit to all sockets that are on in the room for this trainer, currently they enter the room when they're on the profile page
			app.socketio.sockets.in('trainer:' + newdoc._id).emit("trainer:" + newdoc._id + ":updated", newdoc);
		})

		//console.info('notifying [%s] of Save event', socket.address);
		//onSave(socket, doc);
	});

	exports.register = function(socket) {
		socket.on('login', function(trainer){
			console.log(trainer.name, "logging in");
			console.info('notifying [%s] of Login event', socket.address);
		});
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
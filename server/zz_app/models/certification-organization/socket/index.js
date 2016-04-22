module.exports = function(app) {
	var exports = {};
	var Model = app.models.CertificationOrganization;

	Model.schema.post('save', function (doc) {
		Model.findById(doc._id)
			.populate('certifcationTypes')
			.exec(function(err, newdoc){
				if(err) return console.log(err);
				console.log("Emmitting: certificationOrganization:saved which means a specific certificationOrganization was updated now!");
				// emit to all sockets that are on in the room for this trainer, currently they enter the room when they're on the profile page
				app.socketio.sockets.in('certificationOrganization').emit("certificationOrganization:saved", newdoc);
			})
	});
	Model.schema.post('remove', function (doc) {
		console.log("Emmitting: certificationType:removed which means a specific certificationOrganization was updated now!");
		// emit to all sockets that are on in the room for this trainer, currently they enter the room when they're on the profile page
		app.socketio.sockets.in('certificationOrganization').emit("certificationOrganization:removed", doc);
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

		Model.schema.post('remove', function (doc) {
			console.info('notifying [%s] of Remove event', socket.address);
			//onRemove(socket, doc);
		});

	}

	function onSave(socket, doc, cb) {
		// emit a global trainer save event (may want to remove this later augie!)
		socket.emit('trainer:save', doc);
	}

	function onRemove(socket, doc, cb) {
		//socket.emit('trainer:remove', doc);
	}

	return exports;

}
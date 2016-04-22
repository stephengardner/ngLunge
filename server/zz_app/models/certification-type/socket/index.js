module.exports = function(app) {
	var exports = {};
	var Model = app.models.CertificationType;

	Model.schema.post('save', function (doc) {
		Model.findById(doc._id)
			.populate('organization')
			.exec(function(err, newdoc){
				if(err) return console.log(err);
				console.log("Emmitting: certificationType:saved which means a specific certificationType was updated now!");
				// emit to all sockets that are on in the room for this trainer, currently they enter the room when they're on the profile page
				app.socketio.sockets.in('certificationType').emit("certificationType:saved", newdoc);
			})
	});
	Model.schema.post('remove', function (doc) {
		console.log("Emmitting: certificationType:removed which means a specific certificationType was updated now!");
		// emit to all sockets that are on in the room for this trainer, currently they enter the room when they're on the profile page
		app.socketio.sockets.in('certificationType').emit("certificationType:removed", doc);
	});

	exports.register = function(socket) {
		socket.on('login', function(trainer){
			console.log(trainer.name, "logging in");
			console.info('notifying [%s] of Login event', socket.address);
		});
		socket.on('updated', function(trainer){
			console.log("U.P.D.A.T.E.D.");
		});

		Model.schema.post('remove', function (doc) {
			console.info('notifying [%s] of Remove event', socket.address);
		});

	}

	return exports;

}
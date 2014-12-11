/**
 * Broadcast updates to client when the model changes
 */

'use strict';


var trainer = require('./trainer.model');
var app = require('../../app');
exports.register = function(socket) {
	app.e.on('login', function(trainer){
		console.log("LOGIN EVENT!");
	});
	app.e.on('updated', function(trainer){
		console.log("FUCK");
	});
	trainer.schema.post('save', function (doc) {
		onSave(socket, doc);
	});
	trainer.schema.post('remove', function (doc) {
		onRemove(socket, doc);
	});
}

function onSave(socket, doc, cb) {
	socket.emit('trainer:save', doc);
}

function onRemove(socket, doc, cb) {
	socket.emit('trainer:remove', doc);
}
/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var trainer = require('./trainer.model');

exports.register = function(socket) {
	trainer.schema.post('save', function (doc) {
		onSave(socket, doc);
	});
	trainer.schema.post('remove', function (doc) {
		onRemove(socket, doc);
	});
}

function onSave(socket, doc, cb) {
	socket.emit('thing:save', doc);
}

function onRemove(socket, doc, cb) {
	socket.emit('thing:remove', doc);
}
var jwt = require('jsonwebtoken');

module.exports = function setup(options, imports, register) {
	var reviewModel = imports.reviewModel,
		io = imports.socket
	;
	reviewModel.schema.post('save', function(doc){
		var roomName = 'user-reviews:' + doc.to,
			eventName = 'review-updated'
		;
		console.log('emitting eventName: ' + eventName + ' to roomName: ' + roomName);
		doc.populate({path : 'from', select : 'profile_picture name'}, function(err, populated){
			io.to(roomName).emit(eventName, populated);
		})
	});
	register(null, {
		reviewSocket : {}
	})
}

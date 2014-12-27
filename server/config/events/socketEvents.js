var eventor = require('./eventor');
module.exports.setup = function(socket) {
	eventor.socket = socket;
	var things = {

	};
	return eventor;
}
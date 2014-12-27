var globalStuff = require('./globals');
module.exports.setup = function(socket) {
	globalStuff.setSocket(socket);
	return globalStuff;
}
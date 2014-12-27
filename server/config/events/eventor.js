module.exports = {
	socket : false,
	sendEvent : function(){
		socket.emit("fuck", "something");
	}
};
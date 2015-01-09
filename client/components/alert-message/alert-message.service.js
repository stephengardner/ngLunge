lungeApp.factory("AlertMessage", function($timeout){
	var AlertMessage = {
		message : false,
		defaults : {
			closeButton : false,
			duration : 3100
		},
		show : function(type, message, opts) {
			this.type = type;
			this.message = message;
			this.active = 1;
			var opts = angular.extend({}, this.defaults, opts);
			angular.forEach(opts, function(val, key){
				console.log("iterating through option val:", val, " key: ", key);
				AlertMessage[key] = val;
				console.log("AlertMessage." + key + " = ", AlertMessage[key]);
			});
			if(!AlertMessage.closeButton) {
				$timeout(function(){
					AlertMessage.hide();
				}, AlertMessage.duration);
			}
		},
		hide : function() {
			this.active = 0;
		},
		success : function(message, opts){
			AlertMessage.show("success", message, opts);
		},
		error : function(message, opts) {
			AlertMessage.show("error", message, opts);
		},
		info : function(message, opts) {
			AlertMessage.show("info", message, opts);
		}
	};
	return AlertMessage;
});
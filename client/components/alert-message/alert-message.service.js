lungeApp.factory("AlertMessage", function($timeout){
	var AlertMessage = {
		message : false,
		active : false,
		fixed : false,
		defaults : {
			closeButton : false,
			duration : 3100
		},
		timeout : false,
		show : function(type, message, opts) {
			this.type = type;
			this.message = message;
			// alert(message);
			this.active = true;
			var opts = angular.extend({}, this.defaults, opts);
			console.log("Showing alert message with options:", opts);
			angular.forEach(opts, function(val, key){
				//console.log("iterating through option val:", val, " key: ", key);
				AlertMessage[key] = val;
				//console.log("AlertMessage." + key + " = ", AlertMessage[key]);
			});
			if(!AlertMessage.closeButton) {
				if(this.timeout) {
					$timeout.cancel(this.timeout);
				}
				this.timeout = $timeout(function(){
					AlertMessage.hide();
				}, AlertMessage.duration);
			}
		},
		hide : function() {
			this.active = false;
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
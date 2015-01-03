lungeApp.factory("AlertMessage", function($timeout){
	var AlertMessage = {
		message : false,
		show : function() {
			this.active = 1;
		},
		hide : function() {
			this.active = 0;
		},
		success : function(message){
			AlertMessage.type = "success";
			AlertMessage.message = message;
			AlertMessage.show();
			$timeout(function(){
				AlertMessage.hide();
			}, 2500);
		}
	};
	return AlertMessage;
});
lungeApp.factory("InfoOverlay", function(){
	var InfoOverlay = {
		show: function(message) {
			this.active = 1;
			this.message = message;
		},
		hide : function(){
			this.active = 0;
		}
	};
	return InfoOverlay;
});
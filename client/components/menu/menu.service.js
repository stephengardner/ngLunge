lungeApp.factory("MenuService", function(){
	var MenuService = {
		active : false,
		toggle : function() {
			MenuService.active = !MenuService.active;
		},
		show : function() {
			MenuService.active = true;
		},
		hide : function() {
			MenuService.active = false;
		}

	};
	return MenuService;
})
lungeApp.directive("menu", function(){
	return {
		restrict : "AE",
		templateUrl : "menu.partial.html",
		link : function(){
			alert("menu linked");
		}

	}
})
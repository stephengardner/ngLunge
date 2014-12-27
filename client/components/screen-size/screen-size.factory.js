lungeApp.factory("ScreenSize", function($window){
	var ScreenSize = {
		size : "",
		sizeInt : false,
		checkSize : function(){
			if($("#xs").is(":visible")){
				ScreenSize.size = "xs";
				ScreenSize.sizeInt = 1;
			}
			else {
				ScreenSize.sizeInt = 2;
			}
		}
	}
	angular.element($window).bind("resize",function(){
		ScreenSize.checkSize();
	});
	ScreenSize.checkSize();
	$("body").append("<div id='screen-size'></div>");
	return ScreenSize;
})
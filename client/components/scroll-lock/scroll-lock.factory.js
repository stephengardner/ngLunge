myApp.factory("ScrollLock", function(){
	var ScrollLock = {
		scrollTop : 0,
		lock : function(){
			ScrollLock.scrollTop = $("body").scrollTop();
			$(".main-view").css({ position: "fixed", top: -(ScrollLock.scrollTop)});
		},
		unlock : function() {
			$(".main-view").css({ position: "relative", top : 0});
			window.scrollTo(0, ScrollLock.scrollTop);
		}
	};
	return ScrollLock;
});
// EDIT 3.8.2016
// After removing some things, I don't think I need this anymore.
// I could be wrong, but it messed with the positioning of main-view
// since scroll lock is applied to main-view.
myApp.factory("ScrollLock", function(){
	var ScrollLock = {
		scrollTop : 0,
		lock : function(){
			//ScrollLock.scrollTop = $("body").scrollTop();
			//$(".main-view").css({ position: "fixed", top: -(ScrollLock.scrollTop)});
		},
		unlock : function() {
			//$(".main-view").css({ position: "relative", top : 0});
			//window.scrollTo(0, ScrollLock.scrollTop);
		}
	};
	return ScrollLock;
});
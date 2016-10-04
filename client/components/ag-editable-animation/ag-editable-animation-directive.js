myApp.directive('agEditableAnimation', function($animate) {
	return {
		restrict : 'AE',
		link : function(scope, element, attrs) {
			$animate.addClass(element, 'name-of-animation');
		}
	}
});
myApp.animation('.name-of-animation', function() {
	return {
		addClass: function(elem, done){
			done();
		}
	};
});
myApp.animation('.ag-editable-animation-add', agEditableAnimationAdd);
function agEditableAnimationAdd($q, $animateCss) {
	alert("?");
	return {
		addClass: function(element, className, done) {
			var height = element[0].offsetHeight;
			alert("addclass");
			return $animateCss(element, {
				event: 'enter',
				structural: true,
				from: {"opacity": 1, "height": height + "px"},
				to: {"opacity": 1, "height": height + "px"},
				duration: 10
			});
		}
		// NOTE: We do not need the removeClass method, because the message ng-leave animation will fire
		// ,
		// removeClass : function(element, className, done) {
		// 	var messages = getMessagesElement(element);
		// 	if (className == "ag-input-invalid" && messages.hasClass('ag-auto-hide')) {
		// 		hideInputMessages(element, $animateCss, $q).finally(done);
		// 	} else {
		// 		done();
		// 	}
		// }

	}
}
agEditableAnimationAdd.$inject = ["$q", "$animateCss"];
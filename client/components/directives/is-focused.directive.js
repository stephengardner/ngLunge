myApp.directive('isFocused', function($timeout) {
	return {
		scope: { trigger: '@isFocused' },
		link: function(scope, element) {
			scope.$watch('trigger', function(value) {
				var scrollMessageWindowToBottom = function() {
					$timeout(function(){
						var contentArea = $("#message-md-content, #message"),
							scroll = contentArea[0].scrollHeight;
						contentArea.animate({scrollTop : scroll}, 1);
					}, 100);
				};
				if(value === "true") {
					$timeout(function() {
						element[0].focus();
						element.on('blur', function() {
							console.log("regainfocus");
							element[0].focus();
							scrollMessageWindowToBottom();
						});
					});
				}

			});
		}
	};
});
lungeApp.controller("InfoOverlayController", function($scope, InfoOverlay, ProfilePicture) {
	$scope.isActive = function(){
		return InfoOverlay.active;
	}
	$scope.getMessage = function() {
		return InfoOverlay.message;
	};

	$scope.$watch(function(){
		return ProfilePicture.status;
	}, function(status){
		if(status == "cropping" || status == "loading"){
			InfoOverlay.show(status);
		}
		else {
			InfoOverlay.hide();
		}
	})
});
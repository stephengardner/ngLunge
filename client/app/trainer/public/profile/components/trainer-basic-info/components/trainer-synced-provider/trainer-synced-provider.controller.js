lungeApp.controller("TrainerSyncedProviderController", function(TrainerFactory, AlertMessage, $location, InfoOverlay, $window, $scope){
	$scope.isProviderActive = function(provider) {
		if(provider == "linkedin")
			return TrainerFactory.trainerEditing[provider] && TrainerFactory.trainerEditing[provider].publicProfileUrl;
		else {
			return TrainerFactory.trainerEditing[provider] && TrainerFactory.trainerEditing[provider].link;
			//TODO
			//alert("provider not set up for isProviderActive function in trainer basic info controller");
		}
	};

	$scope.getProviderString = function(provider) {
		var asString = {
			linkedin : "LinkedIn",
			google : "Google+",
			twitter : "Twitter",
			facebook : "Facebook"
		}
		return asString[provider];
	}
	$scope.getProviderLink = function(provider) {
		var key;
		if(provider == "linkedin") {
			key = "publicProfileUrl";
		}
		else {
			key = "link";
		}
		return TrainerFactory.trainer[provider][key];
	}
	$scope.unlink = function(provider) {
		TrainerFactory.trainerEditing[provider] = {};
	}
	// link trainer social profiles
	$scope.loginOauth = function(provider) {
		AlertMessage.info("Contacting " + $scope.getProviderString(provider));
		$window.location.href = '/auth/' + provider + "/trainer-sync";
	};

})
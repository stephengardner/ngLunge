lungeApp.controller("TrainerSyncedProviderController", function($window, $scope){
	$scope.isProviderActive = function(provider) {
		if(provider == "linkedin")
			return $scope.trainerEditing[provider] && $scope.trainerEditing[provider].publicProfileUrl
		else {
			return $scope.trainerEditing[provider] && $scope.trainerEditing[provider].link
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
		return $scope.trainer[provider][key];
	}
	$scope.unlink = function(provider) {
		$scope.trainerEditing[provider] = null;
	}

	// link trainer social profiles
	$scope.loginOauth = function(provider) {
		$window.location.href = '/auth/' + provider + "/trainer-sync";
	};

})
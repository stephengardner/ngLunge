myApp.controller('TrainerInfoSectionLinkSocialAccountsController', function(
	AlertMessage,
	TrainerFactory,
	Auth,
	$window,
	$scope,
	$http){
	//$scope.link = function(type){
	//	alert();
	//	$http({
	//		method : 'GET',
	//		url : 'auth/facebook/trainer-sync2'
	//	}).success(function(data){
	//		console.log("Response:", data);
	//	}).error(function(err){
	//		console.log("Error:", err);
	//	})
	//}
	$scope.toggleEditing = function() {
		$scope.editing = !$scope.editing;
		if(!$scope.editing) $scope.reset(form);
		TrainerFactory.setEditingOf('social', $scope.editing);
	};

	$scope.syncOAuth = function(provider) {
		if($scope.trainerHasSocial(provider)) {
			var url = TrainerFactory.trainer[provider].link;
			var win = window.open(url, '_blank');
			win.focus();
		}
		if($scope.editing || $scope.trainerHasSocial(provider)){
			return false;
		}
		$window.location.href = '/auth/' + provider + '/trainer-sync';
	};

	$scope.ajax = {};

	$scope.submit = function() {
		$scope.ajax.busy = true;
		$scope.cgBusy = TrainerFactory.save('social').then(function(response){
			$scope.ajax.busy = false;
			AlertMessage.success("'Social Accounts' section updated");
			if($scope.editing) $scope.editing = false;
		}).catch(function(err){
			$scope.ajax.busy = false;
			//form.$setPristine();
			//FormControl.parseValidationErrors(form, err);
			//$scope.errors = FormControl.errors;
		})
	};

	$scope.trainerFactory = TrainerFactory;

	$scope.removeSocial = function(strategy) {
		TrainerFactory.removeSocial(strategy);
	};

	$scope.reset = function() {
		TrainerFactory.resetEditing('social');
	};

	$scope.trainerHasSocial = function(strategy) {
		var trainer = TrainerFactory.trainerEditing;
		if(trainer[strategy]) {
			return true;
		}
		return false;
	}
})
myApp.controller('TrainerInfoSectionLinkSocialAccountsController', function(
	AlertMessage,
	TrainerFactory,
	Auth,
	$window,
	$scope,
	$http,
	$auth,
    $mdToast
){
	// $scope.toggleEditing = function(opt_force_bool) {
	// 	$scope.editing = opt_force_bool !== undefined ? opt_force_bool : !$scope.editing;
	// 	if(!$scope.editing) $scope.reset(form);
	// 	TrainerFactory.setEditingOf('social', $scope.editing);
	// };

	$scope.syncOAuth = function(provider) {
		if($scope.editing){
			return false;
		}
		if($scope.trainerHasSocial(provider)) {
			var url = TrainerFactory.trainer[provider].link;
			var win = window.open(url, '_blank');
			win.focus();
		}
		else {
			$auth.authenticate(provider, { type : 'trainer-sync' }).then(function(response){
				$mdToast.show($mdToast.simple().position('top right').textContent('Successfully synced account!'));
				console.log("Response is:", response);
				// If we want to do this, set trainer on the response on the server, for every syncing method
				// Auth.setCurrentUser(response.data.trainer);
			}).catch(function(err){
				$mdToast.show($mdToast.simple().position('top right').textContent(err.data.message));
				console.log("err", err);
			});
		}
	};

	$scope.ajax = {};

	$scope.submit = function() {
		$scope.ajax.busy = true;
		$scope.cgBusy = TrainerFactory.save('social').then(function(response){
			$scope.ajax.busy = false;
			AlertMessage.success("'Social Accounts' section updated");
			$scope.toggleEditing(false);
		}).catch(function(err){
			$scope.ajax.busy = false;
		})
	};
	
	$scope.getButtonTitle = function(provider) {
		var hasProvider = $scope.trainerHasSocial(provider.toLowerCase()),
			editing = $scope.editing;
		if(hasProvider) {
			return $scope.trainerFactory.trainer.name.first + '\'s ' + provider + ' profile';
		}
		else {
			return 'Sync your ' + provider + ' account with Lunge';
		}
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
		// console.log("Checking trainerHasSocial for :", strategy, " trainer is:", trainer);
		if(trainer[strategy]) {
			return true;
		}
		return false;
	}
})
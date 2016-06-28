myApp.controller('TrainerInfoSectionLinkSocialAccountsController', function(
	AlertMessage,
	TrainerFactory,
	Auth,
	$window,
	$scope,
	$http,
	$auth,
    $mdToast,
    $mdDialog
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
			if(provider == 'website') {
				return $scope.trainerFactory.trainer.website;
			}
			return $scope.trainerFactory.trainer.name.first + '\'s ' + provider + ' profile';
		}
		else {
			if(!editing) {
				if(provider == 'website') {
					return 'Add a link to your website';
				}
				return 'Sync your ' + provider + ' account with Lunge';
			}
		}
	};

	$scope.trainerFactory = TrainerFactory;

	$scope.removeSocial = function(strategy) {
		TrainerFactory.removeSocial(strategy);
	};

	$scope.reset = function() {
		TrainerFactory.resetEditing('social');
	};

	$scope.personalLinkDialog = function(ev) {
		$mdDialog.show({
			templateUrl : 'app/trainer/public/info/sections/link-social-accounts/website/trainer-link-social-accounts-website-dialog.partial.html',
			clickOutsideToClose : true,
			targetEvent : ev,
			controller : ['$scope', function($scope) {
				$scope.trainerFactory = TrainerFactory;
				$scope.close = function(){
					TrainerFactory.resetEditing('social');
					$mdDialog.hide();
				};
				$scope.submit = function(form){
					if(form.$invalid) return false;
					$scope.cgBusy = TrainerFactory.save().then(function(response) {
						$mdDialog.hide();
					}).catch(function(err) {
						AlertMessage.error('Something went wrong when updating your website');
						logger.error('err:', err);
					});
				}
			}]
		})
	};

	$scope.trainerHasSocial = function(strategy) {
		// console.log("TrainerEditing:", TrainerFactory.trainerEditing, " checking for strat: ", strategy, " = ", TrainerFactory.trainerEditing[strategy]);
		return TrainerFactory.trainerEditing[strategy];
	};

	$scope.removeWebsite = function(){
		TrainerFactory.removeSocial('website');
	};
	$scope.trainerHasWebsite = function() {
		return TrainerFactory.trainerEditing.website;
	}
});
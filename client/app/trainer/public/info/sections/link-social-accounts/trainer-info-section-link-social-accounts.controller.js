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
	$scope.syncOAuth = function(provider) {
		if($scope.editing){
			return false;
		}
		if($scope.hasSocial(provider)) {
			var url = $scope.trainerFactory.user[provider].link;
			var win = window.open(url, '_blank');
			win.focus();
		}
		else {
			$auth.authenticate(provider, { type : 'trainer-sync' }).then(function(response){
				$mdToast.show($mdToast.simple().position('top right').textContent('Successfully synced account!'));
				console.log("Response is:", response);
			}).catch(function(err){
				$mdToast.show($mdToast.simple().position('top right').textContent(err.data.message));
				console.log("err", err);
			});
		}
	};

	$scope.ajax = {};

	$scope.submit = function() {
		$scope.ajax.busy = true;
		$scope.cgBusy = $scope.userFactory.save('social').then(function(response){
			$scope.ajax.busy = false;
			AlertMessage.success("Social accounts updated");
		}).catch(function(err){
			$scope.ajax.busy = false;
		})
	};
	
	$scope.getButtonTitle = function(provider) {
		var hasProvider = $scope.hasSocial(provider.toLowerCase()),
			editing = $scope.editing;
		if(hasProvider) {
			if(provider == 'website') {
				return $scope.userFactory.user.website;
			}
			return $scope.userFactory.user.name.first + '\'s ' + provider + ' profile';
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

	$scope.removeSocial = function(strategy) {
		$scope.userFactory.removeSocial(strategy);
	};

	$scope.reset = function() {
		$scope.userFactory.resetEditing('social');
	};

	$scope.personalLinkDialog = function(ev) {
		$mdDialog.show({
			templateUrl : 'app/trainer/public/info/sections/link-social-accounts/website/trainer-link-social-accounts-website-dialog.partial.html',
			clickOutsideToClose : true,
			targetEvent : ev,
			locals : { userFactory : $scope.userFactory },
			controller : ['$scope', 'userFactory', function($scope, userFactory) {
				$scope.userFactory = userFactory;
				$scope.close = function(){
					$scope.userFactory.resetEditing('social');
					$mdDialog.hide();
				};
				$scope.submit = function(form){
					if(form.$invalid) return false;
					$scope.cgBusy = $scope.userFactory.save('social').then(function(response) {
						$mdDialog.hide();
					}).catch(function(err) {
						AlertMessage.error('Something went wrong when updating your website');
						logger.error('err:', err);
					});
				}
			}]
		})
	};

	$scope.hasSocial = function(strategy) {
		return $scope.userFactory.userEditing[strategy];
	};

	$scope.removeWebsite = function(){
		$scope.userFactory.removeSocial('website');
	};

	$scope.hasWebsite = function() {
		return $scope.userFactory.userEditing.website;
	}
});
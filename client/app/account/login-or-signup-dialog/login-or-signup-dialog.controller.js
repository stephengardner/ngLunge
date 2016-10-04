myApp.controller('LoginOrSignupDialogController', function($mdToast,
                                                           FormControl,
                                                           Auth,
                                                           $auth,
                                                           $state,
                                                           $timeout,
                                                           $mdDialog,
                                                           $http,
                                                           $scope){
	$scope.type = 'trainee';

	$scope.loginSelectedIndex = 0;
	$scope.signupSelectedIndex = 0;
	$scope.selectTab = function(tab) {
		$scope.type = tab;
	};

	$scope.loginOrSignup = 'login';

	$scope.selectLoginOrSignup = function(loginOrSignup) {
		$scope.loginOrSignup = loginOrSignup;
	};
	$scope.trainerLoginLocal = {};
	$scope.errors = {};
	$scope.tabs = {
		User : {

		},
		Trainer : {

		}
	};

	$scope.loginFromDialog = function(form) {
		$scope.submitted = true;
		if(form.$valid) {
			$http({
				method : "POST",
				url : 'auth/local',
				data : {
					type : 'trainer',
					email : $scope.trainerLoginLocal.email,
					password : $scope.trainerLoginLocal.password
				}
			}).success(function(response) {
				Auth.setCurrentUser(response.trainer);
				$mdDialog.hide();
			}).error(function(err){
				console.log("Err:", err);
				FormControl.parseValidationErrors(form, err);
			});
		}
	};


	$scope.loginOAuthFromDialog = function(provider) {
		var type = $scope.type;
		$auth.authenticate(provider, {type : type + '-login'}).then(function(response){
			$mdToast.show($mdToast.simple().position('top right').textContent('Successfully logged in!'));
			Auth.setCurrentUser(response.data[type]);
			$mdDialog.hide(response);
		}).catch(function(err){
			$mdToast.show($mdToast.simple().position('top right').textContent(err.data.message));
			console.log("err", err);
		});
	};
	$scope.trainerLoginOAuthFromDialog = function(provider) {
		$auth.authenticate(provider, {type : 'trainer-login'}).then(function(response){
			$mdToast.show($mdToast.simple().position('top right').textContent('Successfully logged in!'));
			Auth.setCurrentUser(response.data.trainer);
			$mdDialog.hide(response);
		}).catch(function(err){
			$mdToast.show($mdToast.simple().position('top right').textContent(err.data.message));
			console.log("err", err);
		});
	};
});
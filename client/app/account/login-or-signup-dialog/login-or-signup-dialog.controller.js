myApp.controller('LoginOrSignupDialogController', function($mdToast,
                                                     FormControl,
                                                     Auth,
                                                     $auth,
                                                     $state,
                                                           $timeout,
                                                     $http,
                                                     $scope){

	$scope.type = 'trainee';

	// $scope.getSelectedTab = function() {
	// 	if($scope.type == 'trainer') {
	// 		$scope.loginSelectedIndex = 1;
	// 		$scope.signupSelectedIndex = 1;
	// 	}
	// 	else {
	// 		$scope.loginSelectedIndex = 0;
	// 		$scope.signupSelectedIndex = 0;
	// 	}
	// };

	$scope.loginSelectedIndex = 0;
	$scope.signupSelectedIndex = 0;
	$scope.selectTab = function(tab) {
		$scope.type = tab;
	};

	$scope.loginOrSignup = 'login';


	$scope.selectLoginOrSignup = function(loginOrSignup) {
		$scope.loginOrSignup = loginOrSignup;
	};
	$scope.user = {};
	$scope.errors = {};
	$scope.tabs = {
		User : {

		},
		Trainer : {

		}
	};

	$scope.loginFromDialog = function(form) {
		$scope.submitted = true;
		console.log("FORM:",form);
		if(form.$valid) {
			$http({
				method : "POST",
				url : 'auth/local',
				data : {
					type : 'trainer',
					email : $scope.user.email,
					password : $scope.user.password
				}
			}).success(function(response) {
				console.log("Response:", response);
				Auth.setCurrentUser(response.trainer);
				if($scope.afterLogin) {
					$scope.afterLogin();
				}
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
			if($scope.afterLogin) {
				$scope.afterLogin();
			}
		}).catch(function(err){
			$mdToast.show($mdToast.simple().position('top right').textContent(err.data.message));
			console.log("err", err);
		});
	};
	$scope.trainerLoginOAuthFromDialog = function(provider) {
		$auth.authenticate(provider, {type : 'trainer-login'}).then(function(response){
			$mdToast.show($mdToast.simple().position('top right').textContent('Successfully logged in!'));
			Auth.setCurrentUser(response.data.trainer);
			if($scope.afterLogin) {
				$scope.afterLogin();
			}
		}).catch(function(err){
			$mdToast.show($mdToast.simple().position('top right').textContent(err.data.message));
			console.log("err", err);
		});
	};

	$timeout(function(){
		$scope.test = 1;
	}, 1300);
});
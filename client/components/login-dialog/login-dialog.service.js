myApp.factory('LoginDialog', function(Auth, $q, $mdDialog){
	var LoginDialog = {
		test : function(options) {
			return new $q(function(resolve, reject) {
				options = options || {};
				var config = {
					templateUrl : 'app/account/login-or-signup-dialog/login-or-signup-dialog.partial.html',
					controller : 'LoginOrSignupDialogController',
					clickOutsideToClose : true,
					targetEvent : options ? options.ev : undefined,
					parent: angular.element(document.body)
				};
				if(options.scope) {
					config.scope = options.scope;
					config.preserveScope = true;
				}
				if(Auth.isLoggedIn()){
					return resolve(Auth.getCurrentUser());
				}
				$mdDialog.show(config).then(function(response){
					if(response){
						return resolve(response);
					}
					return reject(false);
				}).catch(reject);
			})
		},
		show : function(ev, callback) {
			$mdDialog.show({
				templateUrl : 'app/account/login-or-signup-dialog/login-or-signup-dialog.partial.html',
				controller : 'LoginOrSignupDialogController',
				clickOutsideToClose : true,
				targetEvent : ev,
				scope : $scope,
				preserveScope : true,
				// fullscreen: true,
				parent: angular.element(document.body)
			});
		}
	};
	return LoginDialog
});
myApp.factory('LoginCheck', function(Auth, $q, $mdDialog){
	var LoginCheck = {
		dialogActive : false,
		check : function(options) {
			return $q(function(resolve, reject) {
				var config = {
					templateUrl : 'app/account/login-or-signup-dialog/login-or-signup-dialog.partial.html',
					controller : 'LoginOrSignupDialogController',
					// scope : {
					// 	$mdDialog : $mdDialog
					// },
					clickOutsideToClose : true,
					targetEvent : options.ev,
					// fullscreen: true,
					parent: angular.element(document.body)
				};
				// if(options.scope) {
				// 	config.scope = options.scope;
				// 	config.preserveScope = true;
				// }
				if(Auth.isLoggedIn()){
					return resolve(Auth.getCurrentUser());
				}
				this.dialogActive = true;
				$mdDialog.show(config).then(function(response){
					this.dialogActive = false;
					return resolve(response);
				}.bind(this)).catch(function(err){
					this.dialogActive = false;
					return reject(err);
				}.bind(this));

			}.bind(this));
		},
		show : function(ev, callback) {
			$mdDialog.show({
				templateUrl : 'app/account/login-or-signup-dialog/login-or-signup-dialog.partial.html',
				controller : 'LoginOrSignupDialogController',
				clickOutsideToClose : true,
				targetEvent : ev,
				scope : $scope,
				preserveScope : true,
				// fullscreen: true,
				parent: angular.element(document.body)
			});
		}
	};
	return LoginCheck
});
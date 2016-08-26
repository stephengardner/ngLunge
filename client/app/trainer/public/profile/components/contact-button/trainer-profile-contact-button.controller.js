myApp.controller('TrainerProfileContactButtonController', function(TrainerFactory,
                                                                   $stateParams,
                                                                   $timeout,
                                                                   Trainer, Auth, $scope, $mdDialog) {
	$scope.afterLogin = function() {
		alert();
	};
	$scope.close = $mdDialog.hide;
	$scope.showDialog = function(ev){
		var currentProfilePageId = $scope.trainerFactory.trainer._id;
		if(Auth.getCurrentUser()._id) {
			// $mdDialog.show({
			// 	templateUrl : 'app/account/login-or-signup-dialog/login-or-signup-dialog.partial.html',
			// 	controller : 'LoginOrSignupDialogController',
			// 	clickOutsideToClose : true,
			// 	targetEvent : ev,
			// 	scope : $scope,
			// 	preserveScope : true,
			// 	// fullscreen: true,
			// 	parent: angular.element(document.body)
			// });
			$stateParams.id = '579847e4ef061fc01e1c0ad2';
			$scope.id = '579847e4ef061fc01e1c0ad2';
			$mdDialog.show({
				templateUrl : 'app/messages/message-in-dialog/message.partial.html',
				controller : 'MessageController',
				clickOutsideToClose : true,
				targetEvent : ev,
				scope : $scope,
				preserveScope : true,
				// fullscreen: true,
				// parent: angular.element(document.body)
			})
		}
		function showMessageDialog(){
			$mdDialog.show(
				{
					controller: ['$http',
						'AlertMessage',
						'FormControl',
						function($http,
						         AlertMessage,
						         FormControl) {
							var vm = this;
							vm.currentUser = Auth.getCurrentUser();
							vm.isLoggedIn = function(){
								console.log("isLoggedIn()? Current User is:", Auth.getCurrentUser());
								return Auth.getCurrentUser() && Auth.getCurrentUser()._id;
							};
							vm.inquiry = {
								comment : '',
								user : {
									name : {}
								}
							};
							vm.submit = function(form) {
								if(!form.$valid) {
									console.log("Form is not valid");
									return false;
								}
								vm.busy = Trainer.contactInquiries(
									{
										id : $scope.trainerFactory.trainer._id
									},
									{
										inquiry : vm.inquiry
									}, function(data){
										console.log("Response:", data);
										AlertMessage.success('Your message has been sent to ' + $scope.trainerFactory.trainer.name.first);
										$mdDialog.hide();
									}, function(err){
										if(err.status && err.status == 500) {
											AlertMessage.error(err.data ? err.data.message : 'Something went wrong...');
										}
										if(err.status && err.status == 429) {
											AlertMessage.error('You\'ve sent too many messages recently, please wait a moment and try again');
										}
										FormControl.parseValidationErrors(form, err);
										console.log("Err:", err);
									}
								)
							}
						}],
					focusOnOpen : false,
					locals : {
						trainerFactory : $scope.trainerFactory,
						close : $mdDialog.hide
					},
					controllerAs : 'vm',
					bindToController : true,
					templateUrl: 'app/trainer/public/profile/components/contact-button/dialog/' +
					'trainer-profile-contact-button-dialog.partial.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose : true
				}
			).then(function(location) {

			}, function() {

			});
		}
	};
	// template: "app/trainer/public/profile/components/contact-modal/trainer-contact-modal.partial.html",
	// 	scope: $scope,
	// 	className: 'ngdialog-theme-default large',
	// 	controller: "TrainerContactModalController",
	// 	showClose : false
})
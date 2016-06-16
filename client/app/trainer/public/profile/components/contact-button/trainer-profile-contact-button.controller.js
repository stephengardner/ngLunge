myApp.controller('TrainerProfileContactButtonController', function(Trainer, Auth, $scope, $mdDialog) {
	$scope.showDialog = function(ev){
		$mdDialog.show(
			{
				controller: function($http, AlertMessage, FormControl){
					var vm = this;
					vm.inquiry = {
						comment : '',
						user : {
							name : {
							}
						}
					};
					vm.submit = function(form) {
						// $scope.validateFirstName(form.firstName);
						// $scope.validateEmail(form.email);
						// $scope.validateComment(form.comment);
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
				},
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
	// template: "app/trainer/public/profile/components/contact-modal/trainer-contact-modal.partial.html",
	// 	scope: $scope,
	// 	className: 'ngdialog-theme-default large',
	// 	controller: "TrainerContactModalController",
	// 	showClose : false
})
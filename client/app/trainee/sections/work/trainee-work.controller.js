lungeApp.controller("TraineeWorkController", function($scope,
                                                      UserFactory,
                                                      AlertMessage,
                                                      $mdDialog,
                                                      FormControl,
                                                      TrainerFactory){
	var section = 'work',
		string = 'Work updated';
	$scope.textareaRows = 5;
	$scope.submit = function() {
		$scope.cgBusy = $scope.userFactory.save(section).then(function(response){
			AlertMessage.success(string);
		}).catch(function(err){
			AlertMessage.error('Woops, something went wrong');
			console.error(err);
		})
	};

	$scope.toggleRemoveWorkplace = function(workplace) {
		workplace.removing = !workplace.removing;
	};
	
	$scope.removeWorkplace = function(workplace) {
		$scope.cgBusy = $scope.userFactory.removeWorkplace(workplace).then(function(){
			AlertMessage.success('Removed ' + workplace.company_name + ' from your workplaces');
		}).catch(function(err){
			AlertMessage.error('Woops, something went wrong');
		});
	};

	$scope.addWorkDialog = function(ev) {
		var userFactory = $scope.userFactory;
		$mdDialog.show({
			targetEvent : ev,
			templateUrl : 'app/trainee/sections/work/add-work-dialog/trainee-add-work-dialog.partial.html',
			clickOutsideToClose : true,
			controller : ['$scope', function($scope){
				$scope.userFactory = userFactory;
				$scope.cancel = $mdDialog.hide;
				$scope.workplace = {};
				$scope.submit = function(form) {
					$scope.cgBusy = $scope.userFactory.addWorkplace($scope.workplace).then(function(){
						AlertMessage.success('Workplace added to your profile');
						$mdDialog.hide();
					}).catch(function(err){
						FormControl.parseValidationErrors(form, err);
						AlertMessage.error('Woops, something went wrong');
					});
				}
			}]
		})
	}
	$scope.editWorkDialog = function(workplace, ev) {
		var userFactory = $scope.userFactory;
		
		$mdDialog.show({
			targetEvent : ev,
			templateUrl : 'app/trainee/sections/work/edit-work-dialog/trainee-edit-work-dialog.partial.html',
			clickOutsideToClose : true,
			controller : ['$scope', function($scope){
				$scope.userFactory = userFactory;
				$scope.cancel = $mdDialog.hide;
				$scope.workplace = workplace;
				$scope.submit = function(form) {
					$scope.cgBusy = $scope.userFactory.editWorkplace($scope.workplace).then(function(){
						AlertMessage.success('Workplace edited');
						$mdDialog.hide();
					}).catch(function(err){
						FormControl.parseValidationErrors(form, err);
						AlertMessage.error('Woops, something went wrong');
					});
				}
			}]
		})
	}
});
myApp.controller("TrainerInfoSectionBasicInfoController", function(lodash,
                                                                   AlertMessage,
                                                                   TrainerFactory,
                                                                   FormControl, 
                                                                   $scope){
	$scope.editing = false;
	$scope.trainerFactory = TrainerFactory;
	$scope.ajax = {};

	$scope.reset = function(form) {
		FormControl.removeAllMongooseErrors(form);
		TrainerFactory.resetEditing('basicInfo');
	};

	$scope.submit = function(form) {
		$scope.ajax.busy = true;
		$scope.cgBusy = TrainerFactory.save('basicInfo').then(function(response){
				$scope.ajax.busy = false;
				AlertMessage.success("'Basic Info' section updated");
		}).catch(function(err){
			$scope.ajax.busy = false;
			form.$setPristine();
			FormControl.parseValidationErrors(form, err);
			$scope.errors = FormControl.errors;
		})
	};

	$scope.ageRange = lodash.range(18, 80);
	$scope.yearsOfExperienceRange = lodash.range(0, 40);
});
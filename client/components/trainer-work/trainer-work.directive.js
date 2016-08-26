lungeApp.directive("trainerWork", function(AlertMessage, FormControl, $mdDialog){
	return {
		restrict : "AE",
		scope : {
			editable : '@'
		},
		link : preLink,
		controller : "TrainerWorkController",
		templateUrl : "components/trainer-work/trainer-work.partial.html"
	}

	function preLink($scope, elem, attrs) {
		// var section = 'work',
		// 	string = 'Work updated',
		// 	modelFactory = $scope.modelFactory
		// 	;
		//
		// $scope.$watch(function(){
		// 	return $scope.modelFactory;
		// }, function(newValue, oldValue) {
		// 	console.log("modelFactory on work:", newValue, "oldValue:", oldValue);
		// 	if(newValue && newValue.getDefaultModel && newValue.getDefaultModel()._id) {
		// 		init();
		// 	}
		// });
		//
		// function init(){
		// 	$scope.modelFactoryDefault = modelFactory.getDefaultModel();
		// 	$scope.modelFactoryEditing = modelFactory.getEditingModel();
		//
		// 	$scope.textareaRows = 5;
		// 	$scope.submit = function() {
		// 		$scope.cgBusy = modelFactory.save(section).then(function(response){
		// 			AlertMessage.success(string);
		// 		}).catch(function(err){
		// 			AlertMessage.error('Woops, something went wrong');
		// 			console.error(err);
		// 		})
		// 	};
		//
		// 	$scope.toggleRemoveWorkplace = function(workplace) {
		// 		workplace.removing = !workplace.removing;
		// 	};
		//
		// 	$scope.removeWorkplace = function(workplace) {
		// 		$scope.cgBusy = modelFactory.removeWorkplace(workplace).then(function(){
		// 			AlertMessage.success('Removed ' + workplace.company_name + ' from your workplaces');
		// 		}).catch(function(err){
		// 			AlertMessage.error('Woops, something went wrong');
		// 		});
		// 	};
		//
		// 	$scope.addWorkDialog = function(ev) {
		// 		var modelFactory = modelFactory;
		// 		$mdDialog.show({
		// 			targetEvent : ev,
		// 			templateUrl : 'components/trainer-work/add-work-dialog/trainer-add-work-dialog.partial.html',
		// 			clickOutsideToClose : true,
		// 			controller : function($scope){
		// 				modelFactory = userFactory;
		// 				$scope.cancel = $mdDialog.hide;
		// 				$scope.workplace = {};
		// 				$scope.submit = function(form) {
		// 					$scope.cgBusy = modelFactory.addWorkplace($scope.workplace).then(function(){
		// 						AlertMessage.success('Workplace added to your profile');
		// 						$mdDialog.hide();
		// 					}).catch(function(err){
		// 						FormControl.parseValidationErrors(form, err);
		// 						AlertMessage.error('Woops, something went wrong');
		// 					});
		// 				}
		// 			}
		// 		})
		// 	};
		// 	$scope.editWorkDialog = function(workplace, ev) {
		// 		$mdDialog.show({
		// 			targetEvent : ev,
		// 			templateUrl : 'components/trainer-work/edit-work-dialog/trainer-edit-work-dialog.partial.html',
		// 			clickOutsideToClose : true,
		// 			controller : function($scope){
		// 				$scope.modelFactory = modelFactory;
		// 				$scope.cancel = $mdDialog.hide;
		// 				$scope.workplace = workplace;
		// 				$scope.submit = function(form) {
		// 					$scope.cgBusy = modelFactory.editWorkplace($scope.workplace).then(function(){
		// 						AlertMessage.success('Workplace edited');
		// 						$mdDialog.hide();
		// 					}).catch(function(err){
		// 						FormControl.parseValidationErrors(form, err);
		// 						AlertMessage.error('Woops, something went wrong');
		// 					});
		// 				}
		// 			}
		// 		})
		// 	}
		// }
	}
});
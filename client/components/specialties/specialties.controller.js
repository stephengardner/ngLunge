myApp.controller("SpecialtiesController", function(AlertMessage, TrainerFactory, $q, $http, $scope, $mdDialog){
	$scope.ajax = {
		busy : false,
		promise : false
	};
	$scope.specialty = {
		selected : ''
	};
	$scope.trainerFactory = TrainerFactory;

	$scope.resetSpecialty = function(){
		$scope.ajax.busy = false;
		$scope.specialty = { selected : null };
	};

	$scope.showDialog = function(ev) {
		// Appending dialog to document.body to cover sidenav in docs app
		// Modal dialogs should fully cover application
		// to prevent interaction outside of dialog
		$mdDialog.show(
			{
				focusOnOpen : false,
				controller: 'SpecialtiesDialogController',
				templateUrl: 'components/specialties/dialog/specialties-dialog.partial.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose:true
			}
		).then(function(location) {

		}, function() {

		});
	};

	$scope.toggleRemoveSpecialty = function(specialty){
		specialty.removing = !specialty.removing;
	};

	$scope.removeSpecialty = function(specialty) {
		$scope.ajax.busy = true;
		$scope.cgBusy = TrainerFactory.removeSpecialty(specialty)
			.save()
			.then(function(){
				$scope.toggleRemoveSpecialty(specialty);
				$scope.resetSpecialty();
				AlertMessage.success(specialty.name + ' specialty removed');
			}).catch(function(err){
				$scope.resetSpecialty();
				TrainerFactory.resetEditing('specialties');
				AlertMessage.error("Please enter a valid specialty");
				console.log("Caught error:", err);
			})
	}
});

myApp.controller('SpecialtiesDialogController', function($scope,
                                                         TrainerFactory,
                                                         AlertMessage,
                                                         $mdDialog,
                                                         $http,
                                                         $q,
                                                         $mdToast,
                                                         Auth,
                                                         $timeout
) {

	$scope.close = function() {
		$mdDialog.cancel();
	};

	$scope.userHasSpecialty = function(specialty) {
		console.log(TrainerFactory.trainerEditing.specialties);
		for(var i = 0; i < TrainerFactory.trainerEditing.specialties.length; i++) {
			var specialtyAtIndex = TrainerFactory.trainerEditing.specialties[i];
			console.log("Checking ", specialtyAtIndex, " vs " + specialty);
			if(specialtyAtIndex._id == specialty._id) return true;
		}
		return false;
	};

	$scope.toastSuccess = function($event) {
		var element = angular.element('#specialtiesForm');
		$scope.toast = $mdToast.show({
			parent : angular.element('.md-dialog-container'),
			template : '<md-toast>\
			<span flex>Specialty added!</span>\
			</md-toast>'
		});
		// $timeout(function(){
		// 	alert();
		// }, 500);
		// AlertMessage.success('Specialty added!');
	};
	// $scope.toast.updateTextContent('OK');
	$scope.setSpecialtyFromTypeahead = function($item, $model, $label){
		console.log("Setting specialty from typeahead");
		$scope.specialty = $item;
		$scope.addSpecialty();
	};
	$scope.submit = function(item){
		if(!$scope.selectedItem) {
			return;
		}
		console.log("the specialty is:", $scope.selectedItem);
		$scope.cgBusy = TrainerFactory.addSpecialty($scope.selectedItem)
			.save()
			.then(function(response){
				$scope.toastSuccess();
				$scope.selectedItem = '';
				$scope.searchText = '';
				$scope.$$childTail.selectedItem = '';
				$scope.$$childTail.searchText = '';
			}).catch(function(err){
				// $scope.resetSpecialty();
				TrainerFactory.resetEditing('specialties');
				AlertMessage.error("Please enter a valid specialty");
				console.log("Caught error:", err);
			})
	};
	$scope.test = function(){
		$scope.getSpecialties('');
	}
	$scope.getSpecialties = function(query){
		if(!query) {
			return [];
		}
		var deferred = $q.defer();
		$http({
			url : '/api/specialties/query/' + query,
			params : {
				userId: Auth.getCurrentUser()._id
			}
		}).success(function(res){
			console.log("The result is:", res);
			res = res.length ? res : [];
			deferred.resolve(res);
		}).error(function(res){

		});
		return deferred.promise;
	};
});
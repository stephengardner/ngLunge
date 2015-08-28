myApp.controller("SpecialtiesController", function(AlertMessage, TrainerFactory, $q, $http, $scope){
	$scope.ajax = {
		busy : false
	};
	$scope.specialty = {
		selected : ''
	};
	$scope.trainerFactory = TrainerFactory;
	$scope.getSpecialties = function(query){
		var deferred = $q.defer();
		$http.get('/api/specialties/query/' + query).success(function(res){
			console.log("The result is:", res);
			res = res.length ? res : [];
			deferred.resolve(res);
		}).error(function(res){

		});
		return deferred.promise;
	};

	$scope.resetSpecialty = function(){
		$scope.ajax.busy = false;
		$scope.specialty = { selected : null };
	};

	$scope.setSpecialtyFromTypeahead = function($item, $model, $label){
		console.log("Setting specialty from typeahead");
		$scope.specialty.selected = $item;
	};

	//$scope.reset();

	$scope.addSpecialty = function(){
		$scope.ajax.busy = true;
		console.log("the specialty is:", $scope.specialty.selected);
		TrainerFactory.addSpecialty($scope.specialty.selected)
			.save()
			.then(function(response){
				$scope.resetSpecialty();
			}).catch(function(err){
				$scope.resetSpecialty();
				TrainerFactory.resetEditing('specialties');
				AlertMessage.error("Please enter a valid specialty");
				console.log("Caught error:", err);
			})
	}

	$scope.removeSpecialty = function(specialty) {
		$scope.ajax.busy = true;
		TrainerFactory.removeSpecialty(specialty)
			.save()
			.then(function(response){
				$scope.resetSpecialty();
			}).catch(function(err){
				$scope.resetSpecialty();
				TrainerFactory.resetEditing('specialties');
				AlertMessage.error("Please enter a valid specialty");
				console.log("Caught error:", err);
			})
	}
});

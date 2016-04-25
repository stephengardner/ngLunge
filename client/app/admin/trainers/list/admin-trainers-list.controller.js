lungeApp.provider('Trainer', function() {
	this.$get = ['$resource', function($resource) {
		var Trainer = $resource('api/trainers/:id', {id : '@_id'}, {
			update: {
				method: 'PUT'
			}
		})

		return Trainer;
	}];
});
lungeApp.controller("AdminTrainersListController", function(Trainer, Trainer, $http, $scope){
	// The standard pagination functions
	$scope.search = "";
	$scope.ajax = {
		busy : false
	};
	$scope.things = [];
	$scope.nextMaxId = Infinity;

	// Call the API to retreive a page
	$scope.get = function(){
		if(!$scope.ajax.busy && !$scope.complete) {
			$scope.ajax.busy = true;
			var params = {
				nextMaxId : $scope.nextMaxId,
				query : $scope.search
			};
			console.log("Sending params:",params);
			$http({ method : 'GET', url : '/api/trainers/v1/page', params : params})
				.success(function(things, status, headers) {
					$scope.ajax.busy = false;
					$scope.things = $scope.things.concat(things);
					$scope.nextMaxId = headers('X-Next-Max-Id');
					console.log("NExt max id:", $scope.nextMaxId);
				}).error(function(err, status, headers){
					if(status == 404) {
						$scope.complete = true;
					}
					console.log("Error on get:", err);
					$scope.ajax.loading = false;
				});;
		}
	};

	// Function to process qhen a user types something in the search box
	$scope.query = function() {
		$scope.complete = false;
		$scope.things = [];
		$scope.nextMaxId = Infinity;
		$scope.get();
	};

	// Clear the search box / all results
	$scope.clear = function() {
		$scope.search = "";
		$scope.query();
	};
	$scope.get();
});
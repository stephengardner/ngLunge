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
lungeApp.controller("AdminTrainersListController", function(Trainer, Trainer, $http, $scope, socket){
	$scope.getSize = function(event){
		$scope.width = $(event.target).innerWidth() + 25 + "px";
	}
	$scope.trainers = Trainer.query();

	$scope.delete = function(trainer) {
		$http.delete('/api/trainers/' + trainer._id).then(function(response){
			console.log("The response is:", response);
		}).catch(function(err){
			console.log("The error is: ", err);
		});
	}
	$scope.updateTrainer = function(index, newName, trainer) {
		Trainer.update(trainer);
	};
});
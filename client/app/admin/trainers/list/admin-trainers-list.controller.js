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
lungeApp.controller("AdminTrainersListController", function(Trainer, $http, $scope, socket){
	$scope.getSize = function(event){
		$scope.width = $(event.target).innerWidth() + 25 + "px";
	}
	$scope.trainers = Trainer.query();
	$scope.updateTrainer = function(index, newName, trainer) {
		Trainer.update(trainer);
	};
});
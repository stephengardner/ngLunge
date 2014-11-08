lungeApp.controller("TrainerProfileController", function($scope, $http, $stateParams, socket){
	$http({
		url : '/api/trainers/' + $stateParams.id,
		method : "GET"
	}).success(function(trainer){
		$scope.trainer = trainer;
		console.log(trainer);
		socket.syncUpdates('trainer', $scope.trainer);
	}).error(function(){
	});
});
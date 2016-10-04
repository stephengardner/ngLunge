lungeApp.directive("trainerWork", function(AlertMessage, FormControl, $mdDialog){
	return {
		restrict : "AE",
		controller : "TrainerWorkController",
		controllerAs : 'WorkCtrl',
		templateUrl : "components/trainer-work/trainer-work.partial.html"
	}
});
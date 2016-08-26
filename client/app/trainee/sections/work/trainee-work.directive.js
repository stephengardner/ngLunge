lungeApp.directive("traineeWork", function(){
	return {
		restrict : "AE",
		scope : {
			userFactory : '='
		},
		controller : "TraineeWorkController",
		templateUrl : "app/trainee/sections/work/trainee-work.partial.html"
	}
});
lungeApp.directive("traineeBasicInfo", function(){
	return {
		restrict : "AE",
		scope : {
			userFactory : '='
		},
		controller : "TraineeBasicInfoController",
		templateUrl : "app/trainee/sections/basic-info/trainee-basic-info.partial.html"
	}
});
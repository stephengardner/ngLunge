lungeApp.directive("trainerBasicInfo", function(){
	return {
		restrict : "AE",
		controller : "TrainerBasicInfoController",
		replace : true,

		templateUrl : "app/trainer/public/profile/components/trainer-basic-info/trainer-basic-info.partial.html"
	}
});
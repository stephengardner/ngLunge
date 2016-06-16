lungeApp.directive("trainerBasicInfo", function(){
	return {
		restrict : "AE",
		controller : "TrainerBasicInfoController",
		replace : true,
		scope : {
			editable : '@',
			trainer : '='
		},
		templateUrl : "app/trainer/public/profile/components/trainer-basic-info/trainer-basic-info.partial.html"
	}
});
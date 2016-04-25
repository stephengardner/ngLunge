lungeApp.directive("trainerInfoSectionBasicInfo", function(){
	return {
		restrict : "AE",
		templateUrl : 'app/trainer/public/info/sections/basic-info/trainer-info-section-basic-info.partial.html',
		//scope: {
		//	trainerFactory : '@'
		//},
		scope : {
			togglePopover : '='
		},
		link : {
			post : function(scope, elem, attrs) {
				scope.ready = true;
				console.log("Scope is:", scope);
			}
		},
		controller : 'TrainerInfoSectionBasicInfoController'
	}
})
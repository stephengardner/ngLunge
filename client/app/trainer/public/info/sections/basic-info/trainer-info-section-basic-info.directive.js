lungeApp.directive("trainerInfoSectionBasicInfo", function(){
	return {
		restrict : "AE",
		templateUrl : 'app/trainer/public/info/sections/basic-info/trainer-info-section-basic-info.partial.html',
		scope : {
			userFactory : '<'
		},
		link : {
			post : function(scope, elem, attrs) {
				// this is so that the flash of unstyled content doesn't happen, maybe redo this?
				scope.ready = true;
			}
		},
		controller : 'TrainerInfoSectionBasicInfoController'
	}
})
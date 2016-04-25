lungeApp.directive("trainerInfoSectionEmail", function(){
	return {
		restrict : "AE",
		templateUrl : 'app/trainer/public/info/sections/email/trainer-info-section-email.partial.html',
		//scope: {
		//	trainerFactory : '@'
		//},
		scope : {},
		controller : 'TrainerInfoSectionEmailController'
	}
})
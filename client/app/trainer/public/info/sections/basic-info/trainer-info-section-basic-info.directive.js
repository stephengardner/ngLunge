lungeApp.directive("trainerInfoSectionAbout", function(){
	return {
		restrict : "AE",
		templateUrl : 'app/trainer/public/info/sections/about/trainer-info-section-about.partial.html',
		//scope: {
		//	trainerFactory : '@'
		//},
		scope : {},
		controller : 'TrainerInfoSectionAboutController'
	}
})
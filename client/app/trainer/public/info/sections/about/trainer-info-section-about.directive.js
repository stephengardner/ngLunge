lungeApp.directive("trainerInfoSectionAbout", ['$animateCss', 'TrainerFactory', function($animateCss, TrainerFactory){
	return {
		restrict : "AE",
		templateUrl : 'app/trainer/public/info/sections/about/trainer-info-section-about.partial.html',
		scope : {},
		controller : 'TrainerInfoSectionAboutController'
	}
}]);
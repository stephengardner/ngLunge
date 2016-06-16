myApp.directive('trainerInfoSectionCertifications', function(){
	return {
		restrict : 'E',
		scope : {
			editable : '@'
		},
		templateUrl : 'app/trainer/public/info/sections/certifications/trainer-info-section-certifications.partial.html'
	}
});
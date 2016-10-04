myApp.directive('trainerProfileContactButton', function() {
	return {
		restrict : 'AE',
		templateUrl : 'app/trainer/public/profile/components/contact-button/trainer-profile-contact-button.partial.html',
		controller : 'TrainerProfileContactButtonController',
		scope : {
			userFactory : '<'
		}
	}
});
myApp.directive('trainerProfilePicture', function(){
	return {
		restrict : 'AE',
		templateUrl : 'app/trainer/public/profile/components/profile-picture/trainer-profile-picture.partial.html',
		controller : 'TrainerProfilePictureController',
		replace : true
	}
});
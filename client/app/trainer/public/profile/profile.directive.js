myApp.directive('profile', function(){
	return {
		restrict :'AE',
		templateUrl : 'app/trainer/public/profile/profile.html',
		controller : 'TrainerProfileController',
		link : {
			pre : function(scope, element, attrs){
				// scope.$on('$viewContentLoaded', function() {
				// 	alert();
				// });
			}
		}
	}
});
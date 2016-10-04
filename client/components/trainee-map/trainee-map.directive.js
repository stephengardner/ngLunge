lungeApp.directive("traineeMap", function(traineeMap){
	return {
		restrict : "AE",
		controller : 'TraineeMapController',
		scope : {
			userFactory : '='
		},
		templateUrl: 'components/trainee-map/trainee-map.partial.html',
		link: function (scope, element, attrs) {
			scope.$watch('userFactory', function(userFactory){
				if(userFactory && userFactory.user && userFactory.user._id) {
					console.log("[Trainee Map Directive] watched, waited, and now has a userFactory of: ", userFactory);
					scope.map = traineeMap.init(userFactory.user).map;
					scope.editable = userFactory.isMe();
				}
			});
		}
	}
});
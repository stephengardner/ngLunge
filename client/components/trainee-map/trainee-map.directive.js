lungeApp.directive("traineeMap", function(traineeMap){
	return {
		restrict : "AE",
		controller : 'TraineeMapController',
		scope : {
			userFactory : '='
		},
		templateUrl: 'components/trainee-map/trainee-map.partial.html',
		link: function (scope, element, attrs) {
			// scope.editable = attrs.editable == "false" ? false : scope.$eval(attrs.editable);
			// attrs.$observe('editable', function(val){
			// 	scope.editable = val;
			// });
			scope.$watch('userFactory', function(val){
				if(val && val.user && val.user._id) {
					console.log("trainee map directive got user factory : ", val);
					scope.map = traineeMap.init(scope.userFactory.user).map;
					scope.editable = val.isMe();
				}
			});
		}
	}
});
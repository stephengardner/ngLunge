myApp.directive('traineeMapLocation', function(AlertMessage){
	return  {
		restrict : 'AE',
		templateUrl : 'components/trainee-map/location/trainee-map-location.partial.html',
		link : function(scope, elem, attrs){
			scope.toggleRemovingLocation = function(location){
				console.log("Toggle removing for:", location);
				location.removing = !location.removing;
			}
			scope.removeLocation = function(){
				scope.userFactory.removeLocation().then(function(response){
					AlertMessage.success('Location deleted');
				}).catch(function(err){
					console.log("err:", err);
					AlertMessage.error('Something went wrong, please try again later');
				})
			}
		}
	}
})
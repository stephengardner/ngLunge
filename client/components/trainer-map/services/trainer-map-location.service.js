myApp.factory('trainerMapLocations', function($compile, $timeout, $q, TrainerFactory, AlertMessage){
	var trainerMapLocationService = {
		submitLocation : function(userFactory, location, isManual) {
			return $q(function(resolve, reject) {
				userFactory.addEditedLocation(location, isManual);
				userFactory.save('locations').then(function(response){
					return resolve(response);
				}).catch(function(err){
					userFactory.resetEditing('locations');
					return reject(err);
				});
			});
		}
	};
	return trainerMapLocationService;
});
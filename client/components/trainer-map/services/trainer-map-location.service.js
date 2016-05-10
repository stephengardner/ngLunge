myApp.factory('trainerMapLocations', function($compile, $timeout, $q, TrainerFactory, AlertMessage){
	var trainerMapLocationService = {
		submitLocation : function(location, isManual) {
			return $q(function(resolve, reject) {
				TrainerFactory.addEditedLocation(location, isManual);
				TrainerFactory.save('locations').then(function(response){
					return resolve(response);
				}).catch(function(err){
					TrainerFactory.resetEditing('locations');
					return reject(err);
				});
			});
		}
	};
	return trainerMapLocationService;
});
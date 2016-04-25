myApp.factory('trainerMapLocations', function($compile, $timeout, $q, TrainerFactory, AlertMessage){
	var trainerMapLocationService = {
		submitLocation : function(form, isManual) {
			return $q(function(resolve, reject) {
				TrainerFactory.addEditedLocation(isManual);
				TrainerFactory.save('locations').then(function(response){
					return resolve(response);
				}).catch(function(err){
					form.$setPristine();
					TrainerFactory.resetEditing('locations');
					return reject(err);
				});
			});
		}
	};
	return trainerMapLocationService;
});
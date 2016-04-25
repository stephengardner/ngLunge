// Syncs the Trainer when updated.  We could have called this the Trainer service, but it may be used for users too,
// so this amorphous name is ok for now

myApp.factory('Sync', function($location, Auth, $rootScope){
	var Sync = {
		trainer : false,
		trainerEditing : false,
		syncTrainer : function(trainer) {
			// trainerEditing is useful for when we aren't persisting the model
			this.trainer = trainer;
			this.trainerEditing = angular.copy(trainer);

			// notify controllers that this happened
			//$rootScope.$broadcast('trainerUpdated');
			if(Auth.getCurrentUser() && Auth.getCurrentUser()._id == trainer._id) {
				Auth.setCurrentUser(trainer);
			}

			// if they suddenly changed their urlname, go to that url
			if(Auth.isUserCurrent(trainer) && Auth.getCurrentUser().urlName != trainer.urlName) {
				alert("GOING to urlname");
				$location.url(trainer.urlName);
				$location.replace();
			}
		}
	};
	return Sync;
})
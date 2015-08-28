'use strict'
Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};
myApp.factory("TrainerFactory", function(lodash, $location, $rootScope, Auth, $q, socket){
	var TrainerFactory = {
		trainer : false,
		trainerEditing : false,
		newLocation : {},
		isEditing : {},
		init : function(trainer, options) {
			var DEFAULTS = {
				sync : true,
				syncCallback : angular.noop
			};
			var params = lodash.merge(DEFAULTS, options);
			this.trainer = trainer;
			this.trainerEditing = angular.copy(trainer);
			if(params.sync) {
				this.syncModel(params.syncCallback);
			}
		},
		isMe : function() {
			//console.log("Tjos traomer is: ", this.trainer._id, " The auth current user is:", Auth.getCurrentUser());
			return this.trainer && Auth.getCurrentUser() && this.trainer._id == Auth.getCurrentUser()._id;
		},
		setEditingOf : function(property, value) {
			this.isEditing[property] = value;
		},
		// When updating the TrainerFactory, we will ultimately get synced with the response from the server.
		// But if updating multiple sections, we don't want trainerEditing updated when it's still in editing mode.
		// So, set it to editing mode using "setEditingOf" (in the controller), and then when syncing, this property
		// will be ignored during the sync.
		_createKeepObjectFromEditing : function() {
			var totalObject = {};
			for(var prop in this.isEditing) {
				if(this.isEditing[prop]) {
					totalObject = lodash.merge(totalObject, this._createMergeObjectBySection(prop));
				}
			}
			return totalObject;
		},

		// Two functions need this "mergeObject".  They are for when we only want to SEND certain trainerEditing data
		// to the server, and also when we want to KEEP certain trainerEditing data during a sync process on the client
		// we, again, might want to KEEP certain trainerEditing data because it's not done editing (but a different
		// section was).
		_createMergeObjectBySection : function(section) {
			var mergeObject = {};
			switch(section) {
				case 'email' :
					mergeObject.email = this.trainerEditing.email;
					break;
				case 'about' :
					mergeObject.bio = this.trainerEditing.bio;
					break;
				case 'basicInfo' :
					mergeObject.name = this.trainerEditing.name;
					mergeObject.birthday = this.trainerEditing.birthday;
					mergeObject.gender = this.trainerEditing.gender;
					break;
				case 'locations' :
					mergeObject.locations = this.trainerEditing.locations;
					mergeObject.location = this.trainerEditing.location;
					break;
				case 'specialties' :
					mergeObject.specialties = this.trainerEditing.specialties;
					break;
				default :
					break;
			}
			return mergeObject;
		},

		// Create the object we want to send to the server based on trainerEditing data from only certain sections.
		// That way, if we're updating multiple sections but hit save, we know we're only saving the trainerEditing
		// data from that specific section.
		_createSendObjectFromSection : function(section) {
			var mergeObject = this._createMergeObjectBySection(section);
			var copyOfTrainer = angular.copy(this.trainer);
			return lodash.merge(copyOfTrainer, mergeObject);
		},
		save : function(opt_section, options) {
			var deferred = $q.defer();
			delete TrainerFactory.trainerEditing.location;
			var updatableParams;
			if(opt_section) {
				updatableParams = this._createSendObjectFromSection(opt_section);
			}
			else {
				updatableParams = TrainerFactory.trainerEditing;
			}

			Auth.updateProfile(updatableParams).then(function(updatedUser){
				console.log("--- did we update it???, heres the updatedUser:", updatedUser);
				// Originally we didn't have this setting, everything got taken care of on what looked like
				// the next digest cycle, it was slow.  We want to set this so that the models update on this
				// current digest.
				// edit - scratched the trainerEditing update, that actually throws things out of wack, because
				// trainerUpdating is ALREADY what it should end up being (the updatedUser).  So maybe just set
				// trainer and trhat's all...
				TrainerFactory.trainer = updatedUser;
				//TrainerFactory.trainer = updatedUser
				//TrainerFactory.trainerEditing = updatedUser;//angular.copy(updatedUser);
				//TrainerFactory.trainer = angular.copy(updatedUser);
				deferred.resolve(updatedUser);
			}).catch(function(err){
				if(options && options.resetEditing) {
					TrainerFactory.resetEditing(opt_section);
				}
				deferred.reject(err);
			});
			return deferred.promise;
		},
		addEditedLocation : function(isManual) {
			this.newLocation.type = isManual ? "manual" : undefined;
			this.trainerEditing.locations.push(this.newLocation);
			if(this.trainerEditing.locations.length == 1) {
				this.setPrimaryLocation(this.newLocation);
			}
			return this;
		},
		addSpecialty : function(specialty) {
			if(specialty){
				this.trainerEditing.specialties.push(specialty);
				return this
			}
			else {
				return this;
			}
		},
		removeSpecialty : function(specialty){
			for(var i = 0; i < this.trainerEditing.specialties.length; i++) {
				var specialtyToCheck = this.trainerEditing.specialties[i];
				console.log("Checking", specialty._id, " vs ", specialtyToCheck._id);
				if(specialty._id == specialtyToCheck._id){
					console.log("slicing");
					this.trainerEditing.specialties.remove(i);
				}
			}
			return this;
		},
		resetEditing : function(optionalSection) {
			if(!optionalSection) {
				this.trainerEditing = angular.copy(this.trainer);
			}
			else {
				switch(optionalSection) {
					case 'email' :
						this.trainerEditing.email = angular.copy(this.trainer.email);
						break;
					case 'about' :
						this.trainerEditing.bio = angular.copy(this.trainer.bio);
						break;
					case 'basicInfo' :
						this.trainerEditing.name = angular.copy(this.trainer.name);
						this.trainerEditing.birthday = angular.copy(this.trainer.birthday);
						this.trainerEditing.gender = angular.copy(this.trainer.gender);
						break;
					case 'locations' :
						this.trainerEditing.locations = angular.copy(this.trainer.locations);
						this.trainerEditing.location = angular.copy(this.trainer.location);
						break;
					case 'specialties' :
						this.trainerEditing.specialties = angular.copy(this.trainer.specialties);
						break;
					default :
						break;
				}
			}
		},
		setPrimaryLocation : function(location) {
			for(var i = 0; i < this.trainerEditing.locations.length; i++) {
				var compareLocation = this.trainerEditing.locations[i];
				if(compareLocation._id != location._id) {
					compareLocation.primary = false;
				}
				else {
					this.trainerEditing.location = compareLocation;
					compareLocation.primary = true;
				}
			}
			return this;
		},
		deleteLocation : function(location) {
			this.trainerEditing.locations.remove(this.trainer.locations.indexOf(location));
			if(location.primary) {
				if(this.trainerEditing.locations && this.trainerEditing.locations.length) {
					this.trainerEditing.location = this.trainerEditing.locations[0];
					this.trainerEditing.locations[0].primary = true;
				}
				else {
					this.trainerEditing.location = false;
				}
			}
			return this;
		},
		syncModel : function(cb) {
			var cb = cb || angular.noop;
			socket.sync.user('trainer', this.trainer, function(event, newTrainer){
				this.trainer = newTrainer;
				this.trainerEditing = lodash.merge(angular.copy(newTrainer), this._createKeepObjectFromEditing());
				console.log("Syncing trainerFactory with new Trainer which is:", newTrainer);
				if(Auth.getCurrentUser() && Auth.getCurrentUser()._id == this.trainer._id) {
					Auth.setCurrentUser(this.trainer);
				}
				// if they suddenly changed their urlname, go to that url
				if(Auth.getCurrentUser().urlName != this.trainer.urlName) {
					$location.url(this.trainer.urlName);
					$location.replace();
				}
				$rootScope.$broadcast('trainerUpdated'); // must be at the END
				cb(event, newTrainer);
			}.bind(this));
		},
		unsyncModel : function(){
			socket.unsync.user("trainer", this.trainer);
			socket.unsyncUpdates('trainer');
		}
	};
	return TrainerFactory;
})
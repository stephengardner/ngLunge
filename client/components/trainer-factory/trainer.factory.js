'use strict'

Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};
Array.prototype.pushUnique = function (item){
	if(this.indexOf(item) == -1) {
		//if(jQuery.inArray(item, this) == -1) {
		this.push(item);
		return true;
	}
	return false;
}

function pushUniqueCertification(certificationV2Array, certification_type) {
	console.log("Adding certification_type:", certification_type);
	for(var i = 0; i < certificationV2Array.length; i++) {
		var certification_type_at_index = certificationV2Array[i].certification_type;
		if(certification_type_at_index
			&& certification_type_at_index._id
			&& certification_type
			&& certification_type._id == certification_type_at_index._id){
			certificationV2Array[i].active = true; // see if this works
			console.log("---> set to active!", certificationV2Array[i]);
			return false;
		}
	}
	certificationV2Array.push({
		certification_type : certification_type
	});
	return true;
}
myApp.factory("TrainerFactory", function(lodash, FullMetalSocket, $location, $rootScope, Auth, $q/*, socket*/){
	var TrainerFactory = {
		trainer : false,
		trainerEditing : false,
		newLocation : {},
		isEditing : {},
		rate : {},
		params : {
			syncCallback : angular.noop
		},
		init : function(trainer, options) {
			var DEFAULTS = {
				sync : true,
				syncCallback : angular.noop
			};
			var params = lodash.merge(DEFAULTS, options);
			this.params = params;
			this.trainer = trainer;
			this.trainerEditing = angular.copy(trainer);
			if(this.params.sync) {
				this.syncModel();
			}
		},
		setSyncCallback : function(func) {
			this.params.syncCallback = func
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
				case 'rate' :
					mergeObject.rate = this.trainerEditing.rate;
					break;
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
					mergeObject.age = this.trainerEditing.age;
					mergeObject.years_of_experience = this.trainerEditing.years_of_experience;
					break;
				case 'locations' :
					mergeObject.locations = this.trainerEditing.locations;
					mergeObject.location = this.trainerEditing.location;
					break;
				case 'specialties' :
					mergeObject.specialties = this.trainerEditing.specialties;
					break;
				case 'social' :
					mergeObject.facebook = this.trainerEditing.facebook;
					mergeObject.instagram = this.trainerEditing.instagram;
					mergeObject.twitter = this.trainerEditing.twitter;
					mergeObject.linkedin = this.trainerEditing.linkedin;
					mergeObject.website = this.trainerEditing.website;
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
			console.log("This.trainer is... (and no locations should be null):", this.trainer);
			var copyOfTrainer = angular.copy(this.trainer);
			console.log("copyOfTrainer is:", copyOfTrainer);
			var mergeObject = this._createMergeObjectBySection(section);
			console.log("toReturn is merging angular.copy(this.trainer) which is:", copyOfTrainer, " with mergeObject " +
			"which is: ", mergeObject);
			var toReturn = lodash.deepExtend(copyOfTrainer, mergeObject);

			// when locations are deepExtended with copyOfTrainer, it's merging an arrya of length X
			// into an array of length x-1 and one of them is becomign null, fucking everything up
			toReturn.locations = mergeObject.locations;
			// need to directly set these.  In the instance where the social sync is removed, we want to completely
			// set it as just an empty undefined... Not merge it.
			toReturn.facebook = mergeObject.facebook;
			toReturn.twitter = mergeObject.twitter;
			toReturn.linkedin = mergeObject.linkedin;
			toReturn.instagram = mergeObject.instagram;
			console.log("To return is:", toReturn);
			return toReturn;
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

			console.log("Updatable = :", updatableParams);
			Auth.updateProfile(updatableParams).then(function(updatedUser){
				TrainerFactory.trainer = updatedUser;
				deferred.resolve(updatedUser);
			}).catch(function(err){
				if(options && options.resetEditing) {
					TrainerFactory.resetEditing(opt_section);
				}
				deferred.reject(err);
			});
			return deferred.promise;
		},
		unset : function() {
			this.init({}, {});
		},
		addEditedLocation : function(location, isManual) {
			console.log("Trainer addEditedLocation adding:", location);
			this.newLocation = location;
			this.newLocation.type = isManual ? "manual" : undefined;
			this.trainerEditing.locations.push(this.newLocation);
			console.log("After addEditingLocation, trainerEditing.locations are:", this.trainerEditing.locations);
			if(this.trainerEditing.locations.length == 1) {
				this.setPrimaryLocation(this.newLocation);
			}
			return this;
		},
		removeSocial : function(strategy) {
			this.trainerEditing[strategy] = null;
			return this;
		},
		addSpecialty : function(specialty) {
			if(specialty){
				this.trainerEditing.specialties.push(specialty);
			}
			return this;
		},
		addCertification : function(certification) {
			if(!this.trainerEditing.certifications_v2) {
				this.trainerEditing.certifications_v2 = [];
			}
			if(this.trainerEditing.certifications_v2) {
				pushUniqueCertification(this.trainerEditing.certifications_v2, certification)
			}
			console.log("after adding a certification to the trainer factory, the trainerEditing is:", this.trainerEditing);
			return this;
		},
		removeCertification : function(certification) {
			if(certification && this.trainerEditing.certifications_v2) {
				for(var i = 0; i < this.trainerEditing.certifications_v2.length; i++) {
					var certification_v2_at_index = this.trainerEditing.certifications_v2[i];
					if(certification_v2_at_index.certification_type
						&& certification_v2_at_index.certification_type._id == certification._id) {
						this.trainerEditing.certifications_v2[i].active = false;//.remove(i);
					}
				}
			}
			return this;
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
					case 'rate' :
						this.trainerEditing.rate = angular.copy(this.trainer.rate);
						break;
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
						this.trainerEditing.age = angular.copy(this.trainer.age);
						this.trainerEditing.years_of_experience = angular.copy(this.trainer.years_of_experience);
						break;
					case 'locations' :
						this.trainerEditing.locations = angular.copy(this.trainer.locations);
						this.trainerEditing.location = angular.copy(this.trainer.location);
						break;
					case 'specialties' :
						this.trainerEditing.specialties = angular.copy(this.trainer.specialties);
						break;
					case 'social' :
						this.trainerEditing.facebook = angular.copy(this.trainer.facebook);
						this.trainerEditing.instagram = angular.copy(this.trainer.instagram);
						this.trainerEditing.twitter = angular.copy(this.trainer.twitter);
						this.trainerEditing.linkedin = angular.copy(this.trainer.linkedin);
						this.trainerEditing.website = angular.copy(this.trainer.website);
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
		syncModel : function() {
			var cb = this.params.syncCallback || angular.noop;
			FullMetalSocket.trainer.syncUnauth(this.trainer, function(event, newTrainer) {
				console.log("The trainer factory synced using a socket and the socket came back with this" +
				" as the newTrainer:", newTrainer);
				// Set the trainer to be the response, and the trainerEditing to be the response minus anything
				// we want to keep that is still editing
				this.trainer = newTrainer;
				this.trainerEditing = lodash.merge(angular.copy(newTrainer), this._createKeepObjectFromEditing());
				if(Auth.getCurrentUser() && Auth.getCurrentUser()._id == this.trainer._id) {
					Auth.setCurrentUser(this.trainer);
				}

				// if they suddenly changed their urlname, go to that url
				if(Auth.isUserCurrent(newTrainer) && Auth.getCurrentUser().urlName != this.trainer.urlName) {
					$location.url(this.trainer.urlName);
					$location.replace();
				}
				$rootScope.$broadcast('trainerUpdated'); // must be at the END
				cb(event, newTrainer);
			}.bind(this))

		},
		unsyncModel : function(){
			FullMetalSocket.trainer.unsyncUnauth(TrainerFactory.trainer);
		}
	};
	return TrainerFactory;
})
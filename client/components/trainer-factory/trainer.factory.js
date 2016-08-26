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
	for(var i = 0; i < certificationV2Array.length; i++) {
		var certification_type_at_index = certificationV2Array[i].certification_type;
		if(certification_type_at_index
			&& certification_type_at_index._id
			&& certification_type
			&& certification_type._id == certification_type_at_index._id){
			certificationV2Array[i].active = true; // see if this works
			return false;
		}
	}
	certificationV2Array.push({
		certification_type : certification_type
	});
	return true;
}
myApp.factory("TrainerFactory", function(lodash,
                                         Menu,
                                         FullMetalSocket,
                                         $location,
                                         $rootScope,
                                         Auth,
                                         $timeout,
                                         $q){
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
			return this.trainer && Auth.getCurrentUser() && this.trainer._id == Auth.getCurrentUser()._id;
		},
		setEditingOf : function(property, value) {
			console.log("trainer.factory setting editing of '" + property + "' to: " + value);
			this.isEditing[property] = value;
		},
		initToCurrentTrainerIfNecessary : function() {
			var self = this;
			this.loading = true;
			var isTrainerFactoryAlreadySet = Auth.getCurrentUser() &&
				Auth.getCurrentUser()._id &&
				Auth.getCurrentUser()._id == TrainerFactory.trainer._id;
			if(isTrainerFactoryAlreadySet) {
				console.log("Trainer Account Controller NOT reloading trainerfactory");
				// don't re-init TrainerFactory, it's already on the right person.
				// $scope.trainerFactory = TrainerFactory;
				// Actually, we're just going to doGetTrainer anyways.
				// this is because it doesn't really do anything extra, but it does wait for menu to close.
				doGetTrainer();
			}
			else {
				console.log("Trainer Account Controller RELOADING TRAINERFACTORY");
				doGetTrainer();
			}

			function doGetTrainer(){
				TrainerFactory.unset();
				if(Menu.isOpenLeft) {
					var unbindWatch = $rootScope.$watch(function(){
						return Menu.isOpenLeft
					}, function(newValue, oldValue){
						if(newValue === false) {
							getTrainer();
							unbindWatch();
						}
					});
				}
				else getTrainerWithTimeout();

				function getTrainerWithTimeout() {
					$timeout(function() {
						getTrainer();
					}, 50);
				}

				function getTrainer() {
					Auth.isLoggedInAsync(function () {
						if (Auth.getCurrentType() == "trainer") {
							self.loading = false;
							// $scope.trainerFactory = TrainerFactory;
							TrainerFactory.init(Auth.getCurrentUser(), {
								sync: true
							});
						}
						else {
							// $scope.user = Auth.getCurrentUser();
						}
					});
				}
			}
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
				case 'work' :
					mergeObject.work = this.trainerEditing.work;
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
					mergeObject.headline = this.trainerEditing.headline;
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
			var mergeObject = this._createMergeObjectBySection(section);
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
			return toReturn;
		},
		save : function(opt_section, options) {
			var DEFAULTS = {};
			options = lodash.merge(DEFAULTS, options);

			var deferred = $q.defer();
			delete TrainerFactory.trainerEditing.location;
			var updatableParams;
			if(opt_section) {
				updatableParams = this._createSendObjectFromSection(opt_section);
			}
			else {
				updatableParams = TrainerFactory.trainerEditing;
			}
			// This is essentially how the userFactory does it.
			// 1 - it overwrites the parameters on the client side and
			// 2 - it uses an endpoint that overwrites the parameters on the server-side
			// basically, this works on arrays, it updates THE WHOLE THING.
			if(options.updateOverwrite) {
				var paramsToUpdate = createMergeObjectV2(opt_section),
					valuesToUpdate = {}
					;
				for (var attrname in paramsToUpdate) {
					valuesToUpdate[attrname] = this.trainerEditing[attrname];
				}
				console.log("TrainerFactory.save() updateOverwriteProfile with the following values:", valuesToUpdate);
				Auth.updateOverwriteProfile(valuesToUpdate).then(function(updatedUser){
					TrainerFactory.trainer = updatedUser;
					if(opt_section)
						TrainerFactory.setEditingOf(opt_section, false);
					deferred.resolve(updatedUser);
				}).catch(function(err){
					if(options && options.resetEditing) {
						TrainerFactory.resetEditing(opt_section);
						deferred.reject(err);
					}
					else {
						deferred.reject(err);
					}
				});
			}
			else {
				Auth.updateProfile(updatableParams).then(function(updatedUser){
					TrainerFactory.trainer = updatedUser;
					if(opt_section)
						TrainerFactory.setEditingOf(opt_section, false);
					deferred.resolve(updatedUser);
				}).catch(function(err){
					if(options && options.resetEditing) {
						TrainerFactory.resetEditing(opt_section);
						deferred.reject(err);
					}
					else {
						deferred.reject(err);
					}
				});
			}
			return deferred.promise;
		},
		unset : function() {
			this.init({}, { sync : false });
		},
		addEditedLocation : function(location, isManual) {
			this.newLocation = location;
			this.newLocation.type = isManual ? "manual" : undefined;
			this.trainerEditing.locations.push(this.newLocation);
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
		getDefaultModel : function() {
			return this.trainer;
		},
		getEditingModel : function() {
			return this.trainerEditing;
		},
		addCertification : function(certification) {
			if(!this.trainerEditing.certifications_v2) {
				this.trainerEditing.certifications_v2 = [];
			}
			if(this.trainerEditing.certifications_v2) {
				pushUniqueCertification(this.trainerEditing.certifications_v2, certification)
			}
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
				if(specialty._id == specialtyToCheck._id){
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
					case 'work' :
						this.trainerEditing.work = angular.copy(this.trainer.work);
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
						this.trainerEditing.headline = angular.copy(this.trainer.headline);
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
		addWorkplace : function(workplace) {
			return new $q(function(resolve, reject) {
				this.trainerEditing.work.places.push(workplace);
				this.save('work', { updateOverwrite : true }).then(resolve).catch(reject);
			}.bind(this));
		},
		removeWorkplace : function(workplace) {
			return new $q(function(resolve, reject) {
				var foundPlace = false;
				for(var i = 0; i < this.trainerEditing.work.places.length; i++) {
					var place = this.trainerEditing.work.places[i];
					if(place._id == workplace._id){
						foundPlace = true;
						this.trainerEditing.work.places.splice(i, 1);
						break;
					}
				}
				if(foundPlace) {
					this.save('work', { updateOverwrite : true }).then(resolve).catch(reject);
				}
				else {
					alert('Workplace not found');
					return reject(new Error('Workplace not found'));
				}
			}.bind(this));
		},
		editWorkplace : function(workplace) {
			return new $q(function(resolve, reject) {
				var foundPlace = false;
				for(var i = 0; i < this.trainerEditing.work.places.length; i++) {
					var place = this.trainerEditing.work.places[i];
					if(place._id == workplace._id){
						foundPlace = true;
						this.trainerEditing.work.places[i] = workplace;
						break;
					}
				}
				if(foundPlace) {
					this.save('work', { updateOverwrite : true }).then(resolve).catch(reject);
				}
				else {
					alert('Workplace not found');
					return reject(new Error('workplace not found'));
				}
			}.bind(this));
		},
		syncModel : function() {
			var cb = this.params.syncCallback || angular.noop;
			console.log("trainerFactory calling syncModel with trainer:", this.trainer);
			FullMetalSocket.user.syncUnauth(this.trainer, function(event, newTrainer) {
				console.log("The user factory synced using a socket and the socket came back with this" +
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
			FullMetalSocket.user.unsyncUnauth(TrainerFactory.trainer);
		}
	};
	function createMergeObjectV2(section) {
		var returnObject= {};
		switch(section) {
			case 'basicInfo' :
				returnObject = {
					name : 1,
					gender : 1,
					age : 1,
					headline : 1
				};
				break;
			case 'work' :
				returnObject = {
					work : 1
				};
				break;
			case 'bio' :
				returnObject = {
					bio : 1
				};
				break;
			case 'location' :
				returnObject.location = 1;
				break;
			default :
				console.warn("WARNING!!!!!!!!!!!!!!! " +
					"createMergeObject in user.factory.js: the section didnt match" +
					" anything: '" + section + "'");
				break;
		}
		console.log("CreateMergeObject returning:", returnObject);
		return returnObject;
	}
	return TrainerFactory;
})
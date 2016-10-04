myApp.factory('UserFactory', function(User, $http, lodash, $q){
	var UserFactory = function(user) {
		this.init(user);
	};
	UserFactory.prototype = {
		isMe : function() {
			//console.log("Tjos traomer is: ", this.trainer._id, " The auth current user is:", Auth.getCurrentUser());
			return this.user;// && Auth.getCurrentUser() && this.user._id == Auth.getCurrentUser()._id;
		},

		setEditingOf : function(property, value) {
			console.log('[User Factory] set editing of' + property + ' to ' + value);
			this.isEditing[property] = value;
		},

		toggleEditing : function(section) {
			this.isEditing[section] = !this.isEditing[section];
		},

		init : function(user) {
			var self = this;
			this.isEditing = {};
			if(!user) {
				return whenDone();
			}
			if(!user._id) {
				User.get({
					id : user
				}, function(response){
					whenDone(response);
				}, onErr);
			}
			else {
				whenDone(user);
			}
			function onErr(err) {
				console.log("err initting user factory:", err);
			}
			function whenDone(user) {
				self.setModels(user);
			}
		},

		setModels : function(user) {
			this.user = user;
			this.userEditing = angular.copy(user);
		},

		getDefaultModel : function() {
			return this.user;
		},

		getEditingModel : function() {
			return this.userEditing;
		},

		addWorkplace : function(workplace) {
			return new $q(function(resolve, reject) {
				this.userEditing.work.places.push(workplace);
				this.save('work').then(resolve).catch(reject);
			}.bind(this));
		},

		addSpecialty : function(specialty) {
			if(specialty){
				this.userEditing.specialties.push(specialty);
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
		hasFavoritedUser : function(userId) {
			for(var i = 0; i < this.user.favorite_trainers.length; i++) {
				var favoriteTrainerAtIndex = this.user.favorite_trainers[i];
				if(favoriteTrainerAtIndex == userId) {
					return true;
				}
			}
			return false;
		},

		hasReviewedUser : function(userId) {
			for(var i = 0; i < this.user.reviews.list_users_given.length; i++) {
				var userAtIndex = this.user.reviews.list_users_given[i];
				if(userAtIndex == userId) {
					return true;
				}
			}
			return false;
		},

		addFavoriteTrainer : function(userId) {
			return new $q(function(resolve, reject) {
				this.userEditing.favorite_trainers.push(userId);
				this.save('favoriteTrainers').then(resolve).catch(reject);
			}.bind(this));
		},
		removeFavoriteTrainer : function(userId) {
			return new $q(function(resolve, reject) {
				var found;
				for(var i = 0; i < this.user.favorite_trainers.length; i++) {
					var favoriteTrainerAtIndex = this.user.favorite_trainers[i];
					if(favoriteTrainerAtIndex == userId) {
						this.userEditing.favorite_trainers.splice(i, 1);
						found = true;
						// break;
					}
				}
				if(!found) {
					return reject(new Error('trainer not found in list of favorites'));
				}
				this.save('favoriteTrainers').then(resolve).catch(reject);
			}.bind(this));
		},

		toggleFavoriteTrainer : function(userId) {
			if(this.hasFavoritedUser(userId))
				return this.removeFavoriteTrainer(userId);
			return this.addFavoriteTrainer(userId);
		},

		removeWorkplace : function(workplace) {
			return new $q(function(resolve, reject) {
				var foundPlace = false;
				for(var i = 0; i < this.userEditing.work.places.length; i++) {
					var place = this.userEditing.work.places[i];
					if(place._id == workplace._id){
						foundPlace = true;
						this.userEditing.work.places.splice(i, 1);
						console.log("[UserFactory] removeWorkplace removing workplace: ", place);
						break;
					}
				}
				if(foundPlace) {
					this.save('work').then(resolve).catch(reject);
				}
				else {
					alert('Workplace not found');
					return reject(new Error('workplace not found'));
				}
			}.bind(this));
		},
		editWorkplace : function(workplace) {
			return new $q(function(resolve, reject) {
				var foundPlace = false;
				for(var i = 0; i < this.userEditing.work.places.length; i++) {
					var place = this.userEditing.work.places[i];
					if(place._id == workplace._id){
						foundPlace = true;
						this.userEditing.work.places[i] = workplace;
						console.log("[UserFactory] editing workplace: ", place, " into: ", workplace);
						break;
					}
				}
				if(foundPlace) {
					this.save('work').then(resolve).catch(reject);
				}
				else {
					alert('Workplace not found');
					return reject(new Error('workplace not found'));
				}
			}.bind(this));
		},
		addEditedLocation : function(location, isManual) {
			this.newLocation = location;
			this.newLocation.type = isManual ? "manual" : undefined;
			this.userEditing.locations.push(this.newLocation);
			if(this.userEditing.locations.length == 1) {
				this.setPrimaryLocation(this.newLocation);
			}
			console.log("Added edited location and lcoations is now:", this.userEditing.locations);
			return this;
		},
		setPrimaryLocation : function(location) {
			for(var i = 0; i < this.userEditing.locations.length; i++) {
				var compareLocation = this.userEditing.locations[i];
				if(compareLocation._id != location._id) {
					compareLocation.primary = false;
				}
				else {
					this.userEditing.location = compareLocation;
					compareLocation.primary = true;
				}
			}
			return this;
		},
		deleteLocation : function(location) {
			this.userEditing.locations.remove(this.user.locations.indexOf(location));
			if(location.primary) {
				if(this.userEditing.locations && this.userEditing.locations.length) {
					this.userEditing.location = this.userEditing.locations[0];
					this.userEditing.locations[0].primary = true;
				}
				else {
					this.userEditing.location = false;
				}
			}
			return this;
		},
		resetEditing : function(section) {
			// var itemsToReassign = lodash.assign(createMergeObject(section), this.user);
			var obj = createMergeObject(section),
				valuesToUpdate = {};
			for(var prop in obj) {
				valuesToUpdate[prop] = this.user[prop]
			}
			lodash.assign(this.userEditing, valuesToUpdate);
		},

		removeLocation : function() {
			this.userEditing.location = {};
			return this.save('location')
		},

		removeSocial : function(strategy) {
			this.userEditing[strategy] = null;
			return this;
		},

		removeSpecialty : function(specialty){
			for(var i = 0; i < this.userEditing.specialties.length; i++) {
				var specialtyToCheck = this.userEditing.specialties[i];
				if(specialty._id == specialtyToCheck._id){
					this.userEditing.specialties.remove(i);
				}
			}
			return this;
		},

		addWorkplace : function(workplace) {
			return new $q(function(resolve, reject) {
				this.userEditing.work.places.push(workplace);
				this.save('work', { updateOverwrite : true }).then(resolve).catch(reject);
			}.bind(this));
		},
		editWorkplace : function(workplace) {
			return new $q(function(resolve, reject) {
				var foundPlace = false;
				for(var i = 0; i < this.userEditing.work.places.length; i++) {
					var place = this.userEditing.work.places[i];
					if(place._id == workplace._id){
						foundPlace = true;
						this.userEditing.work.places[i] = workplace;
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
		removeWorkplace : function(workplace) {
			return new $q(function(resolve, reject) {
				var foundPlace = false;
				for(var i = 0; i < this.userEditing.work.places.length; i++) {
					var place = this.userEditing.work.places[i];
					if(place._id == workplace._id){
						foundPlace = true;
						this.userEditing.work.places.splice(i, 1);
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

		save : function(section, options) {
			return new $q(function(resolve, reject){
				var paramsToUpdate = createMergeObject(section),
					valuesToUpdate = {}
					;
				for (var attrname in paramsToUpdate) {
					valuesToUpdate[attrname] = this.userEditing[attrname];
				}
				console.log("[UserFactory] valuesToUpdate: ", valuesToUpdate);
				var userId;

				if(options && options.userId) {
					userId = options.userId;
				}
				else {
					userId = this.user._id;
				}
				if(options && options.updateOverwrite) {
					console.log("[UserFactory] save() " +
						"updateOverwriteProfile with the following values:", valuesToUpdate);
					$http({
						method : 'PUT',
						url : 'api/users/' + userId + '/overwrite',
						data : valuesToUpdate
					}).success(function(updatedUser){
						this.user = lodash.assign(this.user, valuesToUpdate);
						this.userEditing = angular.copy(this.user);
						if(this.isEditing[section])
							this.isEditing[section] = false;
						return resolve(updatedUser);
					}.bind(this)).error(function(err){
						if(options && options.resetEditing) {
							this.resetEditing(section);
							return reject(err);
						}
						else {
							return reject(err);
						}
					}.bind(this));
				}
				else {
					$http({
						method : 'PUT',
						url : 'api/users/' + userId,
						data : valuesToUpdate
					}).success(function(response) {
						this.user = lodash.assign(this.user, valuesToUpdate);
						this.userEditing = angular.copy(this.user);
						if(this.isEditing[section])
							this.isEditing[section] = false;
						return resolve(response);
					}.bind(this)).catch(function(err) {
						console.log("The error:", err);
						this.userEditing = angular.copy(this.user);
						return reject(err);
					}.bind(this))
				}
			}.bind(this))
		}
	};

	function createMergeObject(section) {
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
			case 'favoriteTrainers' :
				returnObject = {
					favorite_trainers : 1
				};
				break;
			case 'chatPressEnterToSend' :
				returnObject = {
					chat_press_enter_to_send : 1
				};
				break;
			case 'rate' :
				returnObject = {
					rate : 1
				};
				break;
			case 'social' :
				returnObject = {
					facebook : 1,
					twitter : 1,
					instagram: 1,
					linkedin: 1,
					website: 1
				};
			break;
			case 'bio' :
				returnObject = {
					bio : 1
				};
				break;
			case 'specialties' :
				returnObject = {
					specialties : 1
				};
				break;
			case 'location' :
				returnObject.location = 1;
				break;
			case 'locations' :
				returnObject.locations = 1;
				break;
			default :
				console.warn("WARNING!!!!!!!!!!!!!!! " +
					"createMergeObject in user.factory.js: the section didnt match" +
					" anything: '" + section + "'");
				break;
		}
		return returnObject;
	}
	return {
		init: function (user) {
			return new UserFactory(user);
		}
	};
});
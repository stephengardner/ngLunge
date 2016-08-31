myApp.factory('UserFactory', function(Auth, User, $http, lodash, $q){
	var UserFactory = function(user) {
		this.init(user);
	};
	UserFactory.prototype = {
		isMe : function() {
			//console.log("Tjos traomer is: ", this.trainer._id, " The auth current user is:", Auth.getCurrentUser());
			return this.user && Auth.getCurrentUser() && this.user._id == Auth.getCurrentUser()._id;
		},

		setEditingOf : function(property, value) {
			console.log('userfactory set editing of' + property + ' to ' + value);
			this.isEditing[property] = value;
		},

		init : function(user) {
			var self = this;
			this.isEditing = {};
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
				console.log("initting user to: ", user);
				self.user = user;
				self.userEditing = angular.copy(user);
			}
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

		removeWorkplace : function(workplace) {
			return new $q(function(resolve, reject) {
				var foundPlace = false;
				for(var i = 0; i < this.userEditing.work.places.length; i++) {
					var place = this.userEditing.work.places[i];
					if(place._id == workplace._id){
						foundPlace = true;
						this.userEditing.work.places.splice(i, 1);
						console.log("userFactory.removeWorkplace removing workplace: ", place);
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
						console.log("userFactory.removeWorkplace editing workplace: ", place, " into: ", workplace);
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

		resetEditing : function(section) {
			console.log("Reset editing on section:", section);
			// var itemsToReassign = lodash.assign(createMergeObject(section), this.user);
			var obj = createMergeObject(section),
				valuesToUpdate = {};
			for(var prop in obj) {
				valuesToUpdate[prop] = this.user[prop]
			}
			lodash.merge(this.userEditing, valuesToUpdate);
		},

		removeLocation : function() {
			this.userEditing.location = {};
			return this.save('location')
		},

		save : function(section, options) {
			return new $q(function(resolve, reject){
				var paramsToUpdate = createMergeObject(section),
					valuesToUpdate = {}
				;
				for (var attrname in paramsToUpdate) {
					valuesToUpdate[attrname] = this.userEditing[attrname];
				}
				console.log("valuesToUpdate:", valuesToUpdate);
				$http({
					method : 'PUT',
					url : 'api/users/' + this.user._id,
					data : valuesToUpdate
				}).success(function(response) {
					console.log("the response:", response);
					this.user = lodash.assign(this.user, valuesToUpdate);
					this.userEditing = angular.copy(this.user);
					return resolve(response);
				}.bind(this)).catch(function(err) {
					console.log("The error:", err);
					this.userEditing = angular.copy(this.user);
					return reject(err);
				}.bind(this))
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
			case 'chatPressEnterToSend' :
				returnObject = {
					chat_press_enter_to_send : 1
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
	return {
		init: function (user) {
			return new UserFactory(user);
		}
	};
});
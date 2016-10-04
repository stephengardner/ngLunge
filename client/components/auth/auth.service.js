'use strict';

angular.module('myApp')
	.factory('Auth', function Auth($state,
	                               $rootScope,
	                               UserFactory,
	                               $http, Trainer,
	                               Registration,
	                               User,
	                               $cookieStore,
	                               $q,
	                               SocketV2) {
		var currentUser = {};
		var onSocketUpdatedCallbacks = [];
		var currentUserFactory = UserFactory.init();
		var currentType = "";
		//console.log("COOKIESTORE: ", $cookieStore.get('token'));
		var Auth = {
			/**
			 * Authenticate user and save token
			 *
			 * @param  {Object}   user     - login info
			 * @param  {Function} callback - optional
			 * @return {Promise}
			 */
			login: function(lunger, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();
				console.log("Auth.login()");
				$http.post('/auth/local', {
					email: lunger.email,
					password: lunger.password,
					type : lunger.type
				}).
				success(function(data) {
					// put the token and user type in our cookie store.  Authenticate the user on every ping request
					$cookieStore.put('token', data.token);
					$cookieStore.put('type', data.type);
					currentType = data.type;
					Auth.type = data.type;
					console.log("client side auth service checking the return json 'type' param og the login() " +
						"response and then GETting whichever it should be");

					User.get(function(response){
						Auth.setCurrentUser(response);
						Auth._authenticateSocket();
						deferred.resolve(data);
					});
				}).
				error(function(err) {
					deferred.reject(err);
				}.bind(this));

				return deferred.promise;
			},

			_authenticateSocket : function() {
				SocketV2.authenticate(this.getToken()).then(this._onSocketAuthenticated.bind(this));
			},
			_onSocketAuthenticated: function() {
				var onAuthUpdatedMessage = 'user:auth:updated';
				console.log('[Auth Service] socket has been authenticated, registering onUpdate events');
				SocketV2._socket.on(onAuthUpdatedMessage, this.onSocketUpdatedMessage);
			},
			setCurrentType : function(type) {
				currentType = type;
			},
			getCurrentType : function() {
				return currentType;
			},

			onSocketUpdatedMessage : function(modelObj) {
				Auth.setCurrentUser(modelObj);
				for(var i = 0; i < onSocketUpdatedCallbacks.length; i++) {
					var callbackAtIndex = onSocketUpdatedCallbacks[i];
					if(callbackAtIndex)
						callbackAtIndex(modelObj);
				}
			},

			addOnSocketUpdatedCallback : function(functionToAdd) {
				console.log('[Auth Service] adding an onSocketUpdated callback function');
				onSocketUpdatedCallbacks.push(functionToAdd);
				return onSocketUpdatedCallbacks.length - 1; // the index is returned
			},

			removeOnSocketUpdatedCallback : function(index) {
				console.log('[Auth Service] removing an onSocketUpdated callback function at index: ' + index);
				delete onSocketUpdatedCallbacks[index];
				// onSocketUpdatedCallbacks = onSocketUpdatedCallbacks.slice(index, 1);// the index i returned from the
				// other method
			},

			submitPassword : function(authenticationHash, password1, password2) {
				return $q(function(resolve, reject){
					Registration.submitPassword({
							id : authenticationHash
						},
						{
							password : password1,
							password2: password2
						}, function(response){
							// token and type set on cookies by the server
							currentUser = User.get(function(response){
								Auth.setCurrentUser(response);
								console.log("Auth server currentUser = Trainer.get success response: ", response);
								resolve(response);
							}, reject);
						}, reject);
				})
			},
			register : function(resolvedTrainerResource, password, password2) {
				var deferred = $q.defer();
				Registration.submitPassword({
						id: resolvedTrainerResource.registration.authenticationHash
					},
					{ password : password, password2 : password2 }, function(response){
						console.log("RESPONSE:", response);
						if(response.token){
							console.log("Auth service register submitPassword callback, setting cookieStore token = :",
								response.token);
							$cookieStore.put('token', response.token);
							$cookieStore.put('type', 'trainer');

							currentUser = User.get(function(response){
								Auth._authenticateSocket();
								console.log("Auth server currentUser = Trainer.get success response: ", response);
								deferred.resolve(response);
							}, function(err){
								console.log("Auth server currentUser = Trainer.get err response: ", err);
								deferred.reject(err);
							});
						}
					}, function(err){
						deferred.reject(err);
						console.log("ERR:",err);
					});
				return deferred.promise;
			},

			/**
			 * Delete access token and user info
			 *
			 * @param  {Function}
			 */
			logout: function() {
				SocketV2.logout();

				$cookieStore.remove('token');
				$cookieStore.remove('type');
				Auth.setCurrentUser({});
			},

			// When the socket pushes a login event, don't push the socket event multiple times
			logoutBySocket : function(){
				console.log("Auth.logoutBySocket(); should only be called once.");
				// Auth.fullMetalSocket.user.unsyncAuth();

				SocketV2.logout();

				$cookieStore.remove('token');
				$cookieStore.remove('type');
				Auth.setCurrentUser({});
				$state.go("main.login");
			},

			/**
			 * Create a new user
			 *
			 * @param  {Object}   user     - user info
			 * @param  {Function} callback - optional
			 * @return {Promise}
			 */
			createUser: function(user, callback) {
				var cb = callback || angular.noop;
				var Model = user.type == "trainer" ? Trainer : User;

				return Model.save(user,
					function(data) {
						$cookieStore.put('token', data.token);
						currentUser = Model.get();
						return cb(user);
					},
					function(err) {
						this.logout();
						return cb(err);
					}.bind(this)).$promise;
			},

			/**
			 * Change password
			 *
			 * @param  {String}   oldPassword
			 * @param  {String}   newPassword
			 * @param  {Function} callback    - optional
			 * @return {Promise}
			 */
			changePassword: function(oldPassword, newPassword, callback) {
				var cb = callback || angular.noop,
					Model = currentType == "trainer" ? Trainer : User;

				return Model.changePassword({ id: currentUser._id }, {
					oldPassword: oldPassword,
					newPassword: newPassword
				}, function(user) {
					return cb(user);
				}, function(err) {
					return cb(err);
				}).$promise;
			},

			contact : function(data) {
				return $q(function(resolve, reject){
					Trainer.contact({ id : currentUser._id }, data,
						resolve, reject);
				})
			},

			changeEmail : function(email, callback) {
				var cb = callback || angular.noop,
					Model = currentType == "trainer" ? Trainer : User;

				return Model.changeEmail({ id: currentUser._id }, {
					email: email
				}, function(user) {
					return cb(user);
				}, function(err) {
					return cb(err);
				}).$promise;
			},

			changeProfilePicture : function(data, callback){
				console.log("Auth changeProfilePicture");
				var cb = callback || angular.noop,
					Model = this.type == "trainer" ? Trainer : User;

				Model = Trainer;
				return Model.changeProfilePicture({ id : currentUser._id }, {
					filepath : data.filepath,
					coords : data.coords
					//profilePicture : ProfilePicture
				}, function(response){
					return cb(response);
				}, function(err) {
					return cb(err);
				}).$promise;
			},

			// For cases where we want to see if the current user is the same as some other user
			// for example, when we're an admin, and we update some other user, we might not want to do certain things
			// such as travel to a URLname on URLname change during trainer syncing.
			isUserCurrent : function(user){
				return user._id == currentUser._id;
			},

			/**
			 * Updates any object on the Trainer / User MongoDB document.  Can be a large or a small update.
			 *
			 * @return {Object} user
			 */
			updateProfile : function(dataObject, callback) {
				var cb = callback || angular.noop,
					Model = this.type == "user" ? User : Trainer;
				console.log("[Auth] calling updateProfile for userId: " + dataObject._id);
				//console.log("*Auth.service.js attempting to update current user with data object: ", dataObject);
				return Model.update({ id: dataObject._id }, dataObject, function(user) {
					// in the event where an admin updates a different user, we don't want to override the admin login
					if(user._id == currentUser._id) {
						Auth.setCurrentUser(user);
					}
					return cb(user);
				}, function(err) {
					console.warn("[Auth] err:", err);
					return cb(err);
				}).$promise;
			},

			updateOverwriteProfile : function(dataObject, callback) {
				var cb = callback || angular.noop,
					Model = this.type == "user" ? User : Trainer;
				console.log("[Auth] calling updateOVERWRITEprofile for userId:", dataObject._id);
				//console.log("*Auth.service.js attempting to update current user with data object: ", dataObject);
				return Model.updateOverwrite({ id: dataObject._id }, dataObject, function(user) {
					// in the event where an admin updates a different user, we don't want to override the admin login
					if(user._id == currentUser._id) {
						Auth.setCurrentUser(user);
					}
					return cb(user);
				}, function(err) {
					console.warn("[Auth] err:", err);
					return cb(err);
				}).$promise;
			},

			/**
			 * Gets all available info on authenticated user
			 *
			 * @return {Object} user
			 */
			getCurrentUser: function() {
				return currentUser;
			},

			getCurrentUserFactory: function() {
				return currentUserFactory;
			},

			// augie added this for socket syncing
			setCurrentUser : function(user) {
				currentUserFactory.setModels(user);
				// I'm using a deep copy.  This protects me against some unwanted behavior.  As the app grows,
				// there might be potential for a shallow copy, but watches and stuff on each update might get too cumbersome
				currentUser = user;//angular.copy(user);
			},

			/**
			 * Check if a user is logged in
			 *
			 * @return {Boolean}
			 */
			isLoggedIn: function() {
				return currentUser.hasOwnProperty('role');
			},

			/**
			 * Waits for currentUser to resolve before checking if user is logged in
			 */
			isLoggedInAsync: function(cb) {
				if(currentUser.hasOwnProperty('$promise')) {
					currentUser.$promise.then(function(response) {
						cb(true);
					}).catch(function(err) {
						console.log("auth service isLoggedInAsync err:", err);
						cb(false);
					});
				} else if(currentUser.hasOwnProperty('role')) {
					cb(true);
				} else {
					cb(false);
				}
			},

			/**
			 * Check if a user is an admin
			 *
			 * @return {Boolean}
			 */
			isAdmin: function() {
				return currentUser.role === 'admin';
			},

			/**
			 * Get auth token
			 */
			getToken: function() {
				return $cookieStore.get('token');
			},

			passwordResetConfirm : function(type, authenticationHash, password1, password2) {
				return $q(function(resolve, reject){
					$http({
						url : 'api/trainers/password-reset/confirm',
						method : 'POST',
						data : {
							authenticationHash : authenticationHash,
							password1 : password1,
							password2 : password2
						}
					}).success(function(response){
						console.log("Response:", response);
						$cookieStore.put('token', response.token);
						$cookieStore.put('type', response.type);
						Auth.qLoginByToken().then(resolve, reject);
					}).catch(reject);
				});
			},

			// Currently only used when the token is updated not by Login or Register
			// This happens when a new password is submitted (after clicking on the link in the email).
			// We send the token back and the type back from the server, log them in, and proceed to their profile
			// page.
			qLoginByToken : function() {
				return $q(function(resolve, reject){
					var type = $cookieStore.get('type'),
						token = $cookieStore.get('token'),
						Model = User
						;
					currentType = type;
					currentUser = Model.get(function(response, headers) {
						console.log("qLoginByToken Successful:", response);
						Auth.setCurrentUser(response);
						// UserSyncer.syncAuth(Auth.getToken());
						alert("loginByToken");
						Auth.fullMetalSocket.user.syncAuth(Auth.getToken());
						return resolve(response);
					}, function(err) {
						console.log('qLoginByToken Failed:', err);
						return reject(err);
					})
				})
			},

			asyncLoginByToken : function() {
				// the token has been set, so simply just shout out to the API to get the user!
				var type = currentType;
				try {
					if($cookieStore.get("type")) {
						var type = $cookieStore.get('type');
						currentType = type;
					}
				}
				catch(err) {
					console.log("Cookiestore error: ", err);
				}
				currentUser = User.get(function(response, headers){
					Auth.setCurrentUser(response);
					Auth._authenticateSocket();
				});
			}
		};
		return Auth;

	});

'use strict';

angular.module('ngLungeFullStack2App')
	.factory('Auth', function Auth($state, $rootScope, $http, Trainer, Registration, User, $cookieStore, $q) {
		var currentUser = {};
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
			setSocket : function(socket) {
				console.log("Set socket to:",socket);
				this.socket = socket;
			},
			// setSocketFactory : function(socketFactory) {
			// 	this.socketFactory = socketFactory;
			// },
			setFullMetalSocket : function(fullMetalSocket){
				this.fullMetalSocket = fullMetalSocket;
			},
			// syncAfterLogin : function () {
			// 	if(Auth.socketFactory && Auth.isLoggedIn() ) {
			// 		console.log("\n-\n-\n-\n-", currentUser);
			// 		Auth.socketFactory.sync.user('trainer', currentUser, function(event, user){
			// 			console.log("FROM THE AUTH FACTORY WERE SETTING THIS TRAINER: Setting...", user);
			// 			Auth.setCurrentUser(user);
			// 		});
			// 	}
			// },
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
					// authenticate the socket.  We could potentially wait and authenticate the socket whenever it
					// next sendsa socket event.  But we're going to authenticate it anyways.  There is an almost
					// infinitely small difference here...
					//Auth.socket.emit('custom-authenticate', {token : Auth.getToken()});
					currentType = data.type;
					Auth.type = data.type;
					// If I watch for this in app.js, this doesn't need to be here.
					//FullMetalSocket.init(Auth.getToken());
					console.log("client side auth service checking the return json 'type' param og the login() " +
						"response and then GETting whichever it should be");
					// if(lunger.type == "user") {
					// 	User.get(function(response){
					// 		currentUser = response;
					// 		deferred.resolve(data);
					// 	});
					// }
					// else {
					// 	Trainer.get(function(response){
					// 		currentUser = response;
					// 		$rootScope.$emit('trainerLogin');
					// 		deferred.resolve(data);
					// 	});
					// }

					User.get(function(response){
						currentUser = response;
						// $rootScope.$emit('login');
						deferred.resolve(data);
					});
				}).
				error(function(err) {
					deferred.reject(err);
				}.bind(this));

				return deferred.promise;
			},

			setCurrentType : function(type) {
				currentType = type;
			},
			getCurrentType : function() {
				return currentType;
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
					})
				return deferred.promise;
			},

			/**
			 * Delete access token and user info
			 *
			 * @param  {Function}
			 */
			logout: function() {
				// if(currentType == "trainer") {
					Auth.fullMetalSocket.user.logout(Auth.getCurrentUser());
					Auth.fullMetalSocket.user.unsyncAuth();
				// }
				$cookieStore.remove('token');
				$cookieStore.remove('type');
				currentUser = {};
			},

			// When the socket pushes a login event, don't push the socket event multiple times
			logoutBySocket : function(){
				console.log("Auth.logoutBySocket(); should only be called once.");
				Auth.fullMetalSocket.user.unsyncAuth();
				$cookieStore.remove('token');
				$cookieStore.remove('type');
				currentUser = {};
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
				console.log("updating inside the Auth service for Model type:", this.type);
				//console.log("*Auth.service.js attempting to update current user with data object: ", dataObject);
				return Model.update({ id: dataObject._id }, dataObject, function(user) {
					// in the event where an admin updates a different user, we don't want to override the admin login
					if(user._id == currentUser._id) {
						currentUser = user;
					}
					return cb(user);
				}, function(err) {
					console.warn("Auth service update profile on the ", Model, " model returned an err: ", err);
					return cb(err);
				}).$promise;
			},
			
			updateOverwriteProfile : function(dataObject, callback) {
				var cb = callback || angular.noop,
					Model = this.type == "user" ? User : Trainer;
				console.log("updating inside the Auth service for Model type:", this.type);
				//console.log("*Auth.service.js attempting to update current user with data object: ", dataObject);
				return Model.updateOverwrite({ id: dataObject._id }, dataObject, function(user) {
					// in the event where an admin updates a different user, we don't want to override the admin login
					if(user._id == currentUser._id) {
						currentUser = user;
					}
					return cb(user);
				}, function(err) {
					console.warn("Auth service update profile on the ", Model, " model returned an err: ", err);
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

			// augie added this for socket syncing
			setCurrentUser : function(user) {
				// I'm using a deep copy.  This protects me against some unwanted behavior.  As the app grows,
				// there might be potential for a shallow copy, but watches and stuff on each update might get too cumbersome
				currentUser = angular.copy(user);
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
						//console.log("auth service isLoggedInAsync response:", response);
						cb(true);
					}).catch(function(err) {
						console.log("auth service isLoggedInAsync err:", err);
						cb(false);
					});
				} else if(currentUser.hasOwnProperty('role')) {
					console.log("auto isLoggedInAsync... potential for error?");
					cb(true);
				} else {
					console.log("auth service isLoggedInAsync does not have own property: role");
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
						currentUser = response;
						// UserSyncer.syncAuth(Auth.getToken());
						Auth.fullMetalSocket.user.syncAuth(Auth.getToken());
						return resolve(response);
					}, function(err) {
						console.log('qLoginByToken Failed:', err);
						return reject(err);
					})
				})
			},

			asyncLoginByToken : function() {
				console.log("Auth asyncLoginByToken");

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
				// var Model = type == 'trainer' : Trainer : User;
				console.log("Getting based on token:", $cookieStore.get('token'), " and type: ", $cookieStore.get('type'));
				// if(type == "trainer"){
				// 	Trainer.get(function(response, headers) {
				// 		currentUser = response;
				// 		console.log("asyncLoginByToken current trainer is :", response);
				// 		Auth.fullMetalSocket.trainer.syncAuth(Auth.getToken());
				// 	}, function(err){
				// 		console.log("Auth service auto login ERRRO: ", err);
				// 	});
				// }
				// else
				currentUser = User.get(function(response, headers){
						currentUser = response;
						Auth.fullMetalSocket.user.syncAuth(Auth.getToken());
						console.log("asyncLoginByToken current user is :", response);
						//Auth.syncAfterLogin();
					});
			}
		};

		//this is now happening in app.run. removed so it wouldn't double-call
		//if($cookieStore.get('token')) {
		//	Auth.asyncLoginByToken();
		//}

		return Auth;

	});

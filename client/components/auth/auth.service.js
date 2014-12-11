'use strict';

angular.module('ngLungeFullStack2App')
	.factory('Auth', function Auth($state, $location, $rootScope, $http, Trainer, Registration, User, $cookieStore, $q) {
		var currentUser = {};
		var currentType = "";
		console.log("COOKIESTORE: ", $cookieStore.get('token'));
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
						//Auth.logout();
						//return;
						console.log("logged in, this should have a token and type: ", data);
						$cookieStore.put('token', data.token);
						$cookieStore.put('type', data.type);
						currentType = data.type;
						Auth.type = data.type;
						console.log("client side auth service checking the return json 'type' param og the login() response and then GETting whichever it should be");
						if(lunger.type == "user") {
							currentUser = User.get();
						}
						else {
							currentUser = Trainer.get();
						}

						deferred.resolve(data);
						return cb();
					}).
					error(function(err) {
						this.logout();
						deferred.reject(err);
						return cb(err);
					}.bind(this));

				return deferred.promise;
			},
			getCurrentType : function() {
				return currentType;
			},
			register : function(resolvedRegistrationResource, password, password2) {
				var deferred = $q.defer();
				Registration.submitPassword({ id: resolvedRegistrationResource._id }, { password : password, password2 : password2 }, function(response){
					console.log("RESPONSE:", response);
					if(response.token){
						console.log("Auth service register submitPassword callback, setting cookieStore token = :", response.token);
						$cookieStore.put('token', response.token);
						$cookieStore.put('type', 'trainer');
						currentUser = Trainer.get(function(response){
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
				$cookieStore.remove('token');
				$cookieStore.remove('type');
				currentUser = {};
			},

			createRegistration : function(registration, callback) {
				var cb = callback || angular.noop;

				return Registration.save(registration,
					function(data) {
						//$cookieStore.put('token', data.token);
						//curentRegi = Trainer.get();
						return cb();
					},
					function(err) {
						//this.logout();
						return cb(err);
					}.bind(this)).$promise;
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

			addCertification: function(certificationStringOrArray, callback) {
				var cb = callback || angular.noop,
					Model = currentType == "trainer" ? Trainer : User;
				return Model.addCertification({ id: currentUser._id }, {
					certification: certificationStringOrArray
				}, function(user) {
					currentUser = user;
					return cb(user);
				}, function(err) {
					return cb(err);
				}).$promise;
			},

			removeCertification: function(certificationStringOrArray, callback) {
				var cb = callback || angular.noop,
					Model = currentType == "trainer" ? Trainer : User;
				return Model.removeCertification({ id: currentUser._id }, {
					certification: certificationStringOrArray
				}, function(user) {
					currentUser = user;
					return cb(user);
				}, function(err) {
					return cb(err);
				}).$promise;
			},

			modifyCertification : function(data, callback) {
				var cb = callback || angular.noop,
					Model = currentType == "trainer" ? Trainer : User;
				return Model.modifyCertification({ id: currentUser._id }, data, function(user) {
					currentUser = user;
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
				return Model.changeProfilePicture({ id : currentUser._id}, {
					filepath : data.filepath,
					coords : data.coords
					//profilePicture : ProfilePicture
				}, function(response){
					return cb(response);
				}, function(err) {
					return cb(err);
				}).$promise;
			},
			/**
			 * Updates any object on the Trainer / User MongoDB document.  Can be a large or a small update.
			 *
			 * @return {Object} user
			 */
			updateProfile : function(dataObject, callback) {
				var cb = callback || angular.noop,
					Model = this.type == "trainer" ? Trainer : User;

				return Trainer.update({ id: currentUser._id }, dataObject, function(user) {
					console.log("Auth service update profile on the ", Model, " model returned an updated user of: ", user);
					currentUser = user;
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
						console.log("auth service isLoggedInAsync response:", response);
						cb(true);
					}).catch(function(err) {
						console.log("auth service isLoggedInAsync err:", err);
						cb(false);
					});
				} else if(currentUser.hasOwnProperty('role')) {
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

			asyncLoginByToken : function() {
				// the token has been set, so simply just shout out to the API to get the user!
				var type = $cookieStore.get('type');
				currentType = type;
				if(type == "trainer")
					currentUser = Trainer.get(function(response, headers){
						console.log("Auth service auto logged in with response: ", response);
					}, function(err){
						console.log("Auth service auto login ERRRO: ", err);
					});
				else
					currentUser = User.get(function(response, headers){});
			}
		};
		if($cookieStore.get('token')) {
			Auth.asyncLoginByToken();
		}
		console.log("current user is:", currentUser);
		return Auth;

	});
var lungeApp = myApp = angular.module('ngLungeFullStack2App', [
	'ui.router',
	'ngCookies',
	'ngResource',
	'ngSanitize',
	'ngMessages',
	'btford.socket-io',
	'ui.bootstrap.tabs',
	'ui.bootstrap.tpls',
	'ui.bootstrap.accordion',
	'ui.bootstrap.typeahead',
	'ngAnimate',
	'mgcrea.ngStrap',
	'ui.utils',
	//'xeditable',
	'geolocation',
	'uiGmapgoogle-maps',
	//'angularFileUpload',
	'duScroll',
	'abcBirthdayPicker',
	'ngDialog',
	'ngLodash',
	'infinite-scroll',
	'ngFileUpload', // using this as new upload service
	'cgBusy',
	'angularValidator',
	'cgBusy',
	'ngMaterial'
])

	.config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
		$urlRouterProvider
			.otherwise('/');

		$locationProvider.html5Mode(true);
		$httpProvider.interceptors.push('authInterceptor');
		$httpProvider.defaults.headers.delete = { "Content-Type": "application/json;charset=utf-8" };
	})
	.config(function(lodash){
		var _ = lodash;
		function deepExtend(obj) {
			var parentRE = /#{\s*?_\s*?}/,
				slice = Array.prototype.slice;

			_.each(slice.call(arguments, 1), function(source) {
				for (var prop in source) {
					if (_.isUndefined(obj[prop]) || _.isFunction(obj[prop]) || _.isNull(source[prop]) || _.isDate(source[prop])) {
						obj[prop] = source[prop];
					}
					else if (_.isString(source[prop]) && parentRE.test(source[prop])) {
						if (_.isString(obj[prop])) {
							obj[prop] = source[prop].replace(parentRE, obj[prop]);
						}
					}
					else if (_.isArray(obj[prop]) || _.isArray(source[prop])){
						if (!_.isArray(obj[prop]) || !_.isArray(source[prop])){
							throw new Error('Trying to combine an array with a non-array (' + prop + ')');
						} else {
							obj[prop] = _.reject(_.deepExtend(_.clone(obj[prop]), source[prop]), function (item) { return _.isNull(item);});
						}
					}
					// Augie Added this...  This might be problematic... Not sure
					else if (_.isObject(obj[prop]) && _.isUndefined(source[prop])){
						console.log("source:", source, " [" +prop + "] is undef");
						obj[prop] = undefined;
					}
					else if (_.isObject(obj[prop]) || _.isObject(source[prop])){
						if (!_.isObject(obj[prop]) || !_.isObject(source[prop])){
							throw new Error('Trying to combine an object with a non-object (' + prop + ')');
						} else {
							obj[prop] = _.deepExtend(_.clone(obj[prop]), source[prop]);
						}
					} else {
						obj[prop] = source[prop];
					}
				}
			});
			return obj;
		};

		_.mixin({ 'deepExtend': deepExtend });
	})
	.factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
		//console.log("cookiestore:", $cookieStore.get("token"));
		return {
			// Add authorization token to headers
			request: function (config) {
				config.headers = config.headers || {};
				if ($cookieStore.get('token')) {
					config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
				}
				return config;
			},

			// Intercept 401s and redirect you to login
			responseError: function(response) {
				if(response.status === 401) {
					$location.path('/login');
					// remove any stale tokens
					$cookieStore.remove('token');
					$cookieStore.remove('type');
					return $q.reject(response);
				}
				else {
					return $q.reject(response);
				}
			}
		};
	}).config(['uiGmapGoogleMapApiProvider', function (GoogleMapApiProvider) {
		GoogleMapApiProvider.configure({
			key: 'AIzaSyCsamhmwhWUGzPQ5v73ZPM-xDeuNhjNIlE',
			//v: '3.13',
			libraries: 'places'
		});
	}])
	.run(function ($timeout, $state, FullMetalSocket, TrainerFactory, $rootScope, $templateCache, $location, Auth/*, editableOptions*/) {
		// works, will login or logout the user if their token changes, this is not for sockets, socket auth
		// is handled within auth.
		$rootScope.$watch(function(){
			return Auth.getToken();
		}, function(newToken, oldToken){
			if(newToken && newToken != "undefined") {
				console.log("Loggin IN - app.js - due to watch on tokens");
				Auth.asyncLoginByToken();
			}
		});
		$rootScope.globalAjax = {
			busy : false
		}

		$rootScope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {
			$rootScope.previousState = from.name;
			$rootScope.currentState = to.name;
		});

		//editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'

		$rootScope.logout = function() {
			console.log("Calling $rootScope.logout");
			Auth.logout();
			$timeout(function(){
				$state.go('main.login');
			});
		};
		// Redirect to login if route requires auth and you're not logged in
		$rootScope.$on('$stateChangeStart', function (event, next) {
			Auth.isLoggedInAsync(function(loggedIn) {
				if (next.authenticate && !loggedIn) {
					$location.path('/login');
				}
			});
		});

		$timeout(function(){
			console.log("Fastclick is attached");
			FastClick.attach(document.body);
		});
	});
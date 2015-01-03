var lungeApp = angular.module('ngLungeFullStack2App', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'btford.socket-io',
  'ui.router',
  'ui.bootstrap',
		'ui.utils',
		'xeditable',
		'geolocation',
		'google-maps'.ns(),
		'ngAnimate',
		'angularFileUpload',
		'duScroll'
])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
	$httpProvider.defaults.headers.delete = { "Content-Type": "application/json;charset=utf-8" };
  })

  .factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
		console.log("cookiestore:", $cookieStore.get("token"));
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
  }).config(['GoogleMapApiProvider'.ns(), function (GoogleMapApi) {
		/*
		GoogleMapApi.configure({
			//    key: 'your api key',
			v: '3.17',
			libraries: 'weather,geometry,visualization'
		});
		*/
	}])

  .run(function ($rootScope, $location, Auth, editableOptions) {
		// works, will login or logout the user if their token changes, this is not for sockets, socket auth
		// is handled within auth.
		$rootScope.$watch(function(){
			return Auth.getToken();
		}, function(token){
			if(token) {
				console.log("logging in");
				Auth.asyncLoginByToken();
			}
			else {
				console.log("logging out");
				// unnnecessary... Auth.logout();
			}
		});
		$rootScope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {
			$rootScope.previousState = from.name;
			$rootScope.currentState = to.name;
			console.log('Previous state:'+$rootScope.previousState)
			console.log('Current state:'+$rootScope.currentState)
		});
		editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
		$rootScope.logout = function() {
			console.log("rootscope logout");
			Auth.logout();
			$location.path('/login');
		};
    // Redirect to login if route requires auth and you're not logged in
		$rootScope.$on('$stateChangeStart', function (event, next) {
			Auth.isLoggedInAsync(function(loggedIn) {
				console.log("app.js rootScope stateChangeStart.  loggedIn = ", loggedIn);
				if(loggedIn) {
					console.log("*************** stateChangeStart and we noticed we are LOGGED IN, we could broadcast a login message here ********************");
					//$rootScope.$broadcast("login");
				}
				if (next.authenticate && !loggedIn) {
					$location.path('/login');
				}
			});

		});
  });
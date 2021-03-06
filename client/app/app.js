var lungeApp = myApp = angular.module('myApp', [
	'ui.router',
	'ngCookies',
	'ngResource',
	'focus-if',
	'ngSanitize',
	'ngMessages',
	'btford.socket-io',
	'ngAnimate',
	'ui.utils',
	//'xeditable',
	'geolocation',
	'uiGmapgoogle-maps',
	//'angularFileUpload',
	'duScroll',
	'abcBirthdayPicker',
	'ngLodash',
	'infinite-scroll',
	'ngFileUpload', // using this as new upload service
	'cgBusy',
	'angularValidator',
	'cgBusy',
	'ngMaterial',
	'focus-if',
	'agFloatingLabel',
	'ngMaterial',
	'ngMdIcons',
	'satellizer',
	'md.data.table',
	'socialMeta',
	'720kb.socialshare',
	'angular-momentjs'
])
	.config(function($mdThemingProvider) {
		// $mdThemingProvider.definePalette('lunge', {
		// 	'400' : '3d069e'
		// });
		var lungeMap = $mdThemingProvider.extendPalette('purple', {
			'500': '#3d069e',
			'contrastDefaultColor': 'light'
		});

		$mdThemingProvider.definePalette('lunge', lungeMap);
		$mdThemingProvider.theme('default').primaryPalette('lunge');
	})
	.config(function($authProvider) {
		$authProvider.httpInterceptor = function(data) {
			// console.log(data);
			//alert("Got some crap");
			return true;
		};
		$authProvider.facebookLogin = $authProvider.facebook;

		$authProvider.oauth2({
			name: 'facebookLogin',
			url: null,
			clientId: null,
			redirectUri: null,
			authorizationEndpoint: null,
			defaultUrlParams: ['response_type', 'client_id', 'redirect_uri'],
			requiredUrlParams: null,
			optionalUrlParams: null,
			scope : ['email', 'public_profile', 'user_birthday', 'user_photos'],
			scopePrefix: null,
			scopeDelimiter: null,
			state: null,
			type: null,
			popupOptions: null,
			responseType: 'code',
			responseParams: {
				code: 'code',
				clientId: 'clientId',
				redirectUri: 'redirectUri'
			}
		});
		$authProvider.facebook({
			url : '/auth/facebook',
			clientId: '302242913297749',
			scope : ['email', 'public_profile', 'user_birthday', 'user_photos']
		});
		$authProvider.linkedin({
			url : '/auth/linkedin',
			scope : ['r_emailaddress'],
			clientId: '78c2key7ro837d'
		});
		$authProvider.twitter({
			url : '/auth/twitter',
			clientId: 'pRsQ5Mak7fxpnjZcajszHj8Qm'
		});
		$authProvider.instagram({
			url : '/auth/instagram',
			clientId: 'f8c38d7e17f3400694bfd43a11f8ae25'
		});
	})
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
	.factory('authInterceptor', function (AlertMessage, $q, $cookieStore, $location) {
		//console.log("cookiestore:", $cookieStore.get("token"));
		var LoginCheck;
		return {
			setLoginCheck : function(loginCheckFactory) {
				LoginCheck = loginCheckFactory;
			},
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
				if(response.status === 429) {
					AlertMessage.error('You\'ve submitted this request too many times.  Please wait 10 minutes and' +
						' then try again');
				}
				if(response.status === 401 && !LoginCheck.dialogActive) {
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
			key: 'AIzaSyATQrT1NiVLNXzXKaVnFDUHBHeKpdQf7vs',
			//v: '3.13',
			libraries: 'places'
		});
	}]).config(['$mdAriaProvider', function ($mdAriaProvider) {
		$mdAriaProvider.disableWarnings();
	}])
	.run(function (authInterceptor,
	               LoginCheck,
	               SocialMeta,
	               $timeout,
	               $state,
	               FullMetalSocket,
	               TrainerFactory,
	               $rootScope,
	               $templateCache,
	               $location,
	               Auth) {

		authInterceptor.setLoginCheck(LoginCheck);

		angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 2000);

		$rootScope.$on('$stateChangeSuccess', function() {
			// angular.element('#main-view').scrollTop(0);
			angular.element('body').scrollTop(0);
		});

		$rootScope.footer = {
			hide : false // controlled for message pages, to hide the footer, we don't need it there
		};

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

		// Shows a busy modal for the whole page.
		$rootScope.globalAjax = {
			busy : false
		};

		$rootScope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {
			$rootScope.previousState = from.name;
			$rootScope.currentState = to.name;
			$rootScope.routerState = {
				current : to.name
			}
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
				// if(next.requiredType == 'trainee') {
				// 	// impelement
				// }
				$rootScope.footer.hide = next.footer === false;
				if (next.authenticate && !loggedIn) {
					$location.path('/login');
				}
			});
		});

		$timeout(function(){
			// console.log("Fastclick is attached");
			// FastClick.attach(document.body);
		});
	});
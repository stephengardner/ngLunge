'use strict';

angular.module('ngLungeFullStack2App')
	.config(function ($stateProvider) {
		$stateProvider
			.state('main.privacy', {
				url: '/privacy',
				templateUrl: 'app/privacy/privacy.partial.html'
			})
	});
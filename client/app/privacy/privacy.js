'use strict';

angular.module('myApp')
	.config(function ($stateProvider) {
		$stateProvider
			.state('main.privacy', {
				url: '/privacy',
				templateUrl: 'app/privacy/privacy.partial.html'
			})
	});
'use strict';
angular.module('ngLungeFullStack2App')
	.config(function ($stateProvider) {
		$stateProvider.
		state('main.trainee', {
			url : "/user",
			abstract : true,
			authenticate : true,
			views : {
				'@main' : {
					template : '<ui-view></ui-view>'
				}
			}
		});
	});
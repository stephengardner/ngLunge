'use strict';

angular.module('ngLungeFullStack2App')
  .config(function ($stateProvider) {
    $stateProvider
	    .state('main.admin', {
		    url: '/admin',
		    templateUrl: 'app/admin/admin.html',
		    controller: 'AdminCtrl'
	    })
	    .state('main.admin-trainers-list', {
		    url: '/admin/trainers/list',
		    templateUrl: 'app/admin/trainers/list/admin-trainers-list.html',
		    controller: 'AdminTrainersListController'
	    })
	    .state('main.admin-certifications-list', {
		    url: '/admin/certifications/list',
		    templateUrl: 'app/admin/certifications/list/admin-certifications-list.html',
		    controller: 'AdminCertificationsListController'
	    });
  });
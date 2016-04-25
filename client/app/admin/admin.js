'use strict';

angular.module('ngLungeFullStack2App')
  .config(function ($stateProvider) {
    $stateProvider
	    .state('main.admin', {
		    url: '/admin',
		    templateUrl: 'app/admin/admin.html',
		    //controller: 'AdminCtrl'
		    abstract : true
	    })
	    .state('main.admin.trainers', {
		    url: '/trainers',
		    templateUrl: 'app/admin/trainers/list/admin-trainers-list.html',
		    controller: 'AdminTrainersListController'
	    })
	    .state('main.admin.trainer', {
		    url: '/trainer/:id',
		    templateUrl: 'app/admin/trainers/individual/admin-trainer-individual.html',
		    controller: 'AdminTrainerIndividualController'
	    })
	    .state('main.admin-certifications', {
		    url: '/admin/certifications',
		    templateUrl: 'app/admin/certifications/list/admin-certifications-list.html',
		    controller: 'AdminCertificationsListController'
	    });
  });
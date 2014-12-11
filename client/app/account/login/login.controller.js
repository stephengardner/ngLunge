'use strict';

angular.module('ngLungeFullStack2App')
  .controller('LoginController', function ($scope, Auth, $location, $window) {

    $scope.user = {};
    $scope.errors = {};

    $scope.login = function(form) {
      $scope.submitted = true;
		console.log("FORM:",form);
      if(form.$valid) {
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password,
	        type : "trainer"
        })
        .then( function() {
          // Logged in, redirect to home
		        console.log("redirecting to home");
          $location.path('/');
        })
        .catch( function(err) {
          $scope.errors.other = err.message;
        });
      }
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };

  });
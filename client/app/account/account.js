
angular.module('ngLungeFullStack2App')
	.config(function ($stateProvider) {
		$stateProvider
			.state('profilePage', {
				parent: 'main',
				url: '^/:urlName',
				controller: "TrainerProfileController",
				/*
				 resolve : {
				 resolvedTrainer : ['Trainer', '$state', '$http', '$stateParams', '$q', function(Trainer, $state, $http, $stateParams, $q){

				 var deferred = $q.defer();
				 $http({
				 url : '/api/trainers/byUrlName/' + $stateParams.urlName,
				 method : "GET"
				 }).success(function(trainer){
				 //$scope.trainer = trainer;
				 console.log("we returned a trainer:", trainer);
				 //socket.syncUpdates('trainer', $scope.trainer);
				 }).error(function(){
				 });
				 return deferred.promise;
				 }]
				 },
				 */
				templateUrl: "app/trainer/public/profile/profile.html"
			});
	});
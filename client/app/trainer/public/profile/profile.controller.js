lungeApp.controller("TrainerProfileController", function($timeout, $rootScope, TrainerFactory, Sync, FormControl,
                                                         $state, AlertMessage, $location, $q, $document, $window,
                                                         ProfilePicture, Auth, $scope, $http,
                                                         $stateParams){
	$scope.trainerFactory = TrainerFactory;

	$scope.$on('$stateChangeStart', function(){
		// This is inside stateChangeStart because when going from the profile to the edit info, the syncing happens
		// after the info page has synced, thereby unsyncing...
		// This is because this state is higher than that one.  We may be able to get by with just syncing once
		// for all main.trainer.... Look into that!
		TrainerFactory.unsyncModel();
	});
	
	var url = $stateParams.urlName ? '/api/trainers/byUrlName/' + $stateParams.urlName
			: '/api/trainers/' + $stateParams.id,
		httpGetTrainer = {
			url : url,
			method : 'GET'
		},
		onGetTrainerSuccess = function(trainer) {
			/*
			TrainerFactory.init(trainer,
				{
					sync : true,
					syncCallback : function(){
						if(Auth.isUserCurrent(TrainerFactory.trainer) && !AlertMessage.active)
							AlertMessage.success("Profile updated successfully");
					}
				});
				*/
			TrainerFactory.init(trainer);
		},
		onGetTrainerError = function(error){
			$scope.noTrainer = true;
		},
		trainerUpdate = function(){
			Auth.updateProfile($scope.trainer, function(){
				console.log("Updated profile");
			});
		};

	// var cleanUpEvent = $rootScope.$on('asyncLoginByToken', function(event){
	// 	$http(httpGetTrainer).success(onGetTrainerSuccess).error(onGetTrainerError);
	// });
	// $scope.$on('$destroy', function() {
	// 	cleanUpEvent();
	// });

	$scope.$state = $state;

	// Check if the trainer is logged in, get their info, populate the page
	Auth.isLoggedInAsync(function(){
		//socket.socket.emit('authenticate', {token : Auth.getToken()});
		$scope.popovers = {
			helpTemplate : {
				templateUrl : 'app/popovers/help.tpl.html'
			},
			location : {
				templateUrl: 'app/popovers/profile/location/popover.tpl.html'
			}
		};

		$scope.states = [
			{value: 1, text: 'DC'},
			{value: 2, text: 'MD'},
			{value: 3, text: 'VA'}
		];

		// $timeout(function(){
			$http(httpGetTrainer).success(onGetTrainerSuccess).error(onGetTrainerError);
		// }, 500000);


		// ajax is an object that tells us if something is running (show ajax spinner, or disable a button, etc)
		$scope.ajax = {};

		$scope.updateProfile = trainerUpdate;

		$scope.isMe = function(){
			//console.log("***************** calling isme and the response is:" + TrainerFactory.isMe() || ($scope.trainer && $scope.trainer._id == Auth.getCurrentUser()._id));
			return TrainerFactory.isMe() || ($scope.trainer && $scope.trainer._id == Auth.getCurrentUser()._id);
		}
	});
});
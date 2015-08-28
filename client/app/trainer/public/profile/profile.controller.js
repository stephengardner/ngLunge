lungeApp.controller("TrainerProfileController", function(TrainerFactory, Sync, FormControl, $state, AlertMessage, $timeout, $location,
                                                         $q, $document, $window, ProfilePicture, Auth, $scope, $http,
                                                         $stateParams, socket){
	$scope.trainerFactory = TrainerFactory;

	var url = $stateParams.urlName ? '/api/trainers/byUrlName/' + $stateParams.urlName
			: '/api/trainers/' + $stateParams.id,
		httpGetTrainer = {
			url : url,
			method : 'GET'
		},
		onGetTrainerSuccess = function(trainer) {
			TrainerFactory.init(trainer,
				{
					sync : true,
					syncCallback : function(){
						if(!AlertMessage.active)
							AlertMessage.success("Profile updated successfully");
					}
				});
		},
		onGetTrainerError = function(error){
			$scope.noTrainer = true;
		},
		trainerUpdate = function(){
			Auth.updateProfile($scope.trainer, function(){
				console.log("Updated profile");
			});
		};

	$scope.$state = $state;

	// Check if the trainer is logged in, get their info, populate the page
	Auth.isLoggedInAsync(function(){
		socket.socket.emit('authenticate', {token : Auth.getToken()});

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

		$http(httpGetTrainer).success(onGetTrainerSuccess).error(onGetTrainerError);

		// ajax is an object that tells us if something is running (show ajax spinner, or disable a button, etc)
		$scope.ajax = {};

		$scope.updateProfile = trainerUpdate;

		$scope.isMe = function(){
			return TrainerFactory.isMe();
		}

		$scope.$on('$destroy', function () {
			TrainerFactory.unsyncModel();
		});
	});
});
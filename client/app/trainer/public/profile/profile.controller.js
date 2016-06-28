lungeApp.controller("TrainerProfileController", function($timeout,
                                                         TrainerFactory,
                                                         $state,
                                                         Auth,
                                                         $scope,
                                                         $http,
                                                         Menu,
                                                         $stateParams){
	TrainerFactory.unset();
	$scope.$on('$destroy', function(){
		TrainerFactory.unset();
	})
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
			TrainerFactory.init(trainer);
			$scope.trainerFactory = TrainerFactory;
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
		if(Menu.isOpenLeft) {
			var unbindWatch = $scope.$watch(function(){
				return Menu.isOpenLeft
			}, function(newValue, oldValue){
				if(newValue === false) {
					getTrainer();
					unbindWatch();
				}
			});
		}
		else getTrainerWithTimeout();
	
	function getTrainerWithTimeout() {
		$timeout(function() {
			getTrainer();
		}, 50);
	}
	
	function getTrainer() {
		Auth.isLoggedInAsync(function(){
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
				return TrainerFactory.isMe() || ($scope.trainer && $scope.trainer._id == Auth.getCurrentUser()._id);
			}
		});
	}
});
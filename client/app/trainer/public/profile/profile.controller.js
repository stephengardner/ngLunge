lungeApp.controller("TrainerProfileController", function($timeout, $state, $location, $q, $document, $window, ProfilePicture, Auth, $scope, $http, $stateParams, socket){
	Auth.isLoggedInAsync(function(){
		socket.socket.emit('authenticate', {token : Auth.getToken()});
		$scope.$window = $window;
		$scope.resetErrors = function(opt_error) {
			if(opt_error && $scope.errors) {
				$scope.errors[opt_error] = null;
			}
			else {
				$scope.errors = {};
			}
		};

		$scope.showEObject = function($event, eObject) {
			$scope.getSize($event);
			// force width from getSize to repaint by using $timeout
			$timeout(function(){
				eObject.$show();
			})
		};

		$scope.getSize = function(event){
			if(event && event.target) {
				$scope.width = $(event.target).innerWidth() + 25 + "px";
			}
			else {
				$scope.width = $(event).innerWidth() + 25 + "px";
			}
		};

		$scope.states = [
			{value: 1, text: 'DC'},
			{value: 2, text: 'MD'},
			{value: 3, text: 'VA'}
		];

		$scope.syncTrainer = function(newTrainer) {
			$scope.trainer = newTrainer;
			$scope.trainerEditing = angular.copy(newTrainer);
			if(Auth.getCurrentUser().urlName != newTrainer.urlName) {
				$location.url(newTrainer.urlName);
				$location.replace();
			}
			//Auth.setCurrentUser($scope.trainer);
			// I don't know why the $apply is necessary here, but it has to be here to update the certifications.
			// I guess because the certification loop in the scope is a nested object... Not sure... (probably way off)
			console.log("Syncing the new trainers name to be: ", newTrainer.name.first, newTrainer.name.last);
			$scope.$apply();
		}

		if($stateParams.urlName) {
			$http({
				url : '/api/trainers/byUrlName/' + $stateParams.urlName,
				method : "GET"
			}).success(function(trainer){
				$scope.syncTrainer(trainer);
				socket.sync.user('trainer', trainer,  function(event, newTrainer){
					console.log("in sync.user callback, syncing trainer:", newTrainer);
					$scope.syncTrainer(newTrainer);
				});
			}).error(function(){
				$scope.noTrainer = true;
			});
		}
		else {
			$http({
				url : '/api/trainers/' + $stateParams.id,
				method : "GET"
			}).success(function(trainer){
				$scope.syncTrainer(trainer);
				socket.sync.user('trainer', trainer,  function(event, newTrainer){
					console.log("in sync.user callback, syncing trainer:", newTrainer);
					$scope.syncTrainer(newTrainer);
				});
			}).error(function(){
			});
		}
		// ajax is an object that tells us if something is running (show ajax spinner, or disable a button, etc)
		$scope.ajax = {};
		$scope.updateProfile = function() {
			Auth.updateProfile($scope.trainer, function(){
				console.log("Updated profile");
			});
		};
		$scope.isMe = function(){
			return $scope.trainer && $scope.trainer._id == Auth.getCurrentUser()._id;
		};
		$scope.$on('$destroy', function () {
			$scope.unsync.user("trainer", $scope.trainer);
			socket.unsyncUpdates('trainer');
		});
	});
});
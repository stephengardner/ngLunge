lungeApp.controller("TrainerProfileController", function($timeout,
                                                         TrainerFactory,
                                                         $state,
                                                         Auth,
                                                         $scope,
                                                         $http,
                                                         Menu,
                                                         SocialMeta,
                                                         TrainerMeta,
                                                         $stateParams){
	function doWeNeedToReloadTrainerFactory() {
		var urlName = $stateParams.urlName ? $stateParams.urlName : false;
		if(urlName && TrainerFactory.trainer && TrainerFactory.trainer.urlName == urlName) {
			return false;
		}
		return true;
	}
	if(doWeNeedToReloadTrainerFactory()) {
		console.log("Trainer Profile Controller RELOADING TRAINERFACTORY");
		doGetTrainerWithPing();
	}
	else {
		console.log("Trainer Profile Controller NOT reloading trainerfactory");
		doGetTrainerWithoutPing();
	}
	// $scope.$on('$destroy', function(){
	// 	TrainerFactory.unset();
	// })
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
			console.log("onGetTrainerSuccess trainer:", trainer);
			TrainerFactory.init(trainer);
			$scope.trainerFactory = TrainerFactory;
			setSocialMeta();
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

	$scope.getSocialDescription = function() {
		var trainer = $scope.trainerFactory.trainer;
		var description;
		if(trainer.bio) {
			description = trainer.bio;
		}
		else {
			var name = trainer.name.first,
				location = trainer.location.city
					+ ", "
					+ trainer.location.state,
				hasLocation = trainer.location.city,
				hasSpecialties = trainer.specialties && trainer.specialties.length;

			description = 'Get started training with ' + name + ' today.';
			if(hasLocation) {
				description += ' Located in ' + location + ".";
			}
			if(hasSpecialties) {
				var length = trainer.specialties.length,
					str = ' ' + name + ' specializes in ';
				if(length == 1) {
					str += trainer.specialties[0].name;
				}
				if(length == 2) {
					str += trainer.specialties[0].name + ' and ' + trainer.specialties[1].name
				}
				if(length > 2) {
					str += trainer.specialties[0].name + ', ' + trainer.specialties[1].name + ', and ' + length - 2 + ' others';
				}
				str += '.';
				description += str;
			}
		}
		return description;
	};
	function setSocialMeta() {
		var trainer = $scope.trainerFactory.trainer;

		SocialMeta.set({
			title : TrainerMeta.title(),
			image : trainer.profile_picture.thumbnail.url,
			description : TrainerMeta.description()
		});
	}
	function doGetTrainerWithoutPing() {
		if(Menu.isOpenLeft) {
			TrainerFactory.unset();
			var unbindWatch = $scope.$watch(function(){
				return Menu.isOpenLeft
			}, function(newValue, oldValue){
				if(newValue === false) {
					TrainerFactory.init(Auth.getCurrentUser(), {
						sync: true
					});
					$scope.trainerFactory = TrainerFactory;
					setSocialMeta();
					unbindWatch();
				}
			});
		}
		else {
			$scope.trainerFactory = TrainerFactory;
		}
	}

	function doGetTrainerWithPing() {
		TrainerFactory.unset();
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

			});
		}
	}
	$scope.isMe = function(){
		return TrainerFactory.isMe() || ($scope.trainer && $scope.trainer._id == Auth.getCurrentUser()._id);
	}

});
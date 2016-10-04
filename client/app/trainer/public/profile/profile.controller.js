lungeApp.controller("TrainerProfileController", function($timeout,
                                                         $state,
                                                         Auth,
                                                         $scope,
                                                         $http,
                                                         Menu,
                                                         SocialMeta,
                                                         $mdSidenav,
                                                         Reviews,
                                                         UserFactory,
                                                         UserMeta,
                                                         SocketV2,
                                                         UserSyncer,
                                                         $stateParams){
	
	Auth.isLoggedInAsync(function(){
		doGetTrainerWithPing();
	});
	$scope.$on('$destroy', function() {
		if($scope.userFactory) {
			UserSyncer.unsyncUnauthUserFactory($scope.userFactory);
		}
		else {
			console.warn('[Trainer Profile Controller] there was no userFactory when exiting this state, must\'ve' +
				' logged out');
		}
	});


	var url = $stateParams.urlName ?
		'/api/trainers/byUrlName/' + $stateParams.urlName :
		'/api/trainers/' + $stateParams.id,
		httpGetTrainer = {
			url : url,
			params : {
				viewAs : Auth.getCurrentUser()._id
			},
			method : 'GET'
		},
		onGetTrainerSuccess = function(trainer) {
			$scope.userFactory = new UserFactory.init(trainer);
			console.log("[Trainer Profile Controller] got user factory.", $scope.userFactory);
			$scope.editable = $scope.userFactory.isMe();
			UserSyncer.syncUnauthUserFactory($scope.userFactory);
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
		var trainer = $scope.userFactory.trainer;
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
		var newSocialAttributes = UserMeta.generalMeta($scope.userFactory);
		console.log('[Profile Controller] new social attributes: ', newSocialAttributes);
		SocialMeta.set(newSocialAttributes);
	}

	function doGetTrainerWithPing() {
		// need to add the $mdSidenav check, because our custom service "Menu" doesn't log if it's closed when
		// clicking on the backdrop
		if(Menu.isOpenLeft && $mdSidenav('left').isOpen()) {
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
});
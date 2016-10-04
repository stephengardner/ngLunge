myApp.controller('TrainerProfileContactButtonController', function(TrainerFactory,
                                                                   $stateParams,
                                                                   $timeout,
                                                                   $rootScope,
                                                                   Trainer,
                                                                   Auth,
                                                                   $http,
                                                                   $scope,
                                                                   LoginCheck,
                                                                   ChatSocket,
                                                                   $q,
                                                                   $mdDialog) {
	$scope.close = $mdDialog.hide;
	$scope.showDialog = function(ev){
		var currentProfilePageId = $scope.userFactory.user._id;
		LoginCheck.check({ev : ev}).then(function(response){
			$rootScope.globalAjax.busy = getOrCreateChat().then(function(response){
				openChatDialog(response);
			}).catch(function(err){
				alert("ERROR OPENING CHAT");
			})
		}).catch(function(err){
			// alert('err');
		});

		function getOrCreateChat() {
			return $q(function(resolve, reject) {
				$http({
					method : 'GET',
					url : 'api/users/' + Auth.getCurrentUser()._id + '/chat/to/' + currentProfilePageId
				}).success(resolve).error(reject);
			})
		}
		function openChatDialog(id) {
			$stateParams.id = id;
			$scope.id = id;
			if(Auth.getCurrentUser()._id == currentProfilePageId) {
				$scope.sendingChatToSelf = true;
			}
			$mdDialog.show({
				templateUrl : 'app/messages/message-in-dialog/message.partial.html',
				controller : 'MessageController',
				controllerAs : 'vm',
				clickOutsideToClose : true,
				targetEvent : ev,
				scope : $scope,
				preserveScope : true
			});
		}
	};
})
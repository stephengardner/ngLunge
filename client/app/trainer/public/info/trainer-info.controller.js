myApp.controller("TrainerInfoController", function(TrainerFactory, AlertMessage, /*socket,*/ FormControl,
                                                   $popover, Sync, $scope, Auth){

	$scope.editingPrivacyFor = false;

	$scope.trainerFactory = TrainerFactory;

	$scope.isMe = function(){
		return TrainerFactory.isMe() || ($scope.trainer && $scope.trainer._id == Auth.getCurrentUser()._id);
	};

	// Sync the user up. and we're good to go!
	Auth.isLoggedInAsync(function(){
		TrainerFactory.init(Auth.getCurrentUser(), { sync : true });
	});
	$scope.$on('$destroy', function(){
		TrainerFactory.unsyncModel();
	});
	// END controller syncing
	/*
	$scope.$on("privacy-change", function(event, value){
		if($scope.editingPrivacyFor) {
			$scope.trainerFactory.trainerEditing[$scope.editingPrivacyFor].privacy = value;
			privacyPopover.$promise.then(privacyPopover.toggle);
			$scope.editingPrivacyFor = false;
		}
	});

	$scope.togglePopover = function(event, modelToEdit){
		if(modelToEdit == $scope.editingPrivacyFor) {
			privacyPopover.$promise.then(privacyPopover.hide);
			$scope.editingPrivacyFor = false;
		}
		else {
			$scope.editingPrivacyFor = modelToEdit;
			console.log("ModelToEdit:", $scope.editingPrivacyFor);
			privacyPopover = $popover(angular.element(event.currentTarget), {
				contentTemplate: 'app/popovers/profile/info/privacy/popover.tpl.html',
				html: true,
				trigger: 'manual',
				animation : 'am-flip-x',
				placement : 'left',
				autoClose: true
			});
			privacyPopover.$promise.then(privacyPopover.toggle);
		}
	};
	*/
})
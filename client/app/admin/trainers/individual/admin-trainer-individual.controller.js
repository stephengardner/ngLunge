myApp.controller("AdminTrainerIndividualController", function(TrainerFactory, $stateParams, Trainer,
                                                              $http, $scope){
	$scope.editing = false;
	$scope.adminPerformingAction = true;
	Trainer.get({id : $stateParams.id}, function(response){
		$scope.trainer = response;
		TrainerFactory.init(response);
		$scope.trainerFactory = TrainerFactory;
		console.log("THE SCOPE TRAINER FACTORY IS:", TrainerFactory);
	}, function(err){
		console.log("Error:", err);
	})
	$scope.isMe = function(){
		return true;
	}
	$scope.$on('$destroy', function(){
		TrainerFactory.unset();
	})

	$scope.$on("privacy-change", function(event, value){
		$scope.trainerFactory.trainerEditing[$scope.editingPrivacyFor].privacy = value;
		privacyPopover.$promise.then(privacyPopover.toggle);
		$scope.editingPrivacyFor = false;
	});

	$scope.togglePopover = function(event, modelToEdit){
		if(modelToEdit == $scope.editingPrivacyFor) {
			privacyPopover.$promise.then(privacyPopover.hide);
			$scope.editingPrivacyFor = false;
		}
		else {
			$scope.editingPrivacyFor = modelToEdit;
			// privacyPopover = $popover(angular.element(event.currentTarget), {
			// 	contentTemplate: 'app/popovers/profile/info/privacy/popover.tpl.html',
			// 	html: true,
			// 	trigger: 'manual',
			// 	animation : 'am-flip-x',
			// 	placement : 'left',
			// 	autoClose: true
			// });
			// privacyPopover.$promise.then(privacyPopover.toggle);
		}
	};

	$scope.onBirthdayChange = function(value){
		console.log("CHANING TO DO:", value);
		var date = new Date(value);

		console.log("Date is:", date);
		TrainerFactory.trainerEditing.birthday.value = date;
	}
})
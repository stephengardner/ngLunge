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
	// Remaining scope functions outside of syncing
	$scope.removeMongooseError = FormControl.removeMongooseError;
	$scope.$watch(function() {
		return FormControl.errors
	}, function(newErrors){
			$scope.errors = newErrors;
	});
	// toggle editing for a specific section
	// such as: 'basicInfo'
	$scope.toggleEditing = function(section) {
		TrainerFactory.resetEditing('basicInfo');
		if($scope.editing == section)
			$scope.editing = false;
		else
			$scope.editing = section;
	}
	$scope.editing = false;
	$scope.onBirthdayChange = function(value){
		console.log("CHANING TO DO:", value);
		var date = new Date(value);

		console.log("Date is:", date);
		TrainerFactory.trainerEditing.birthday.value = date;
	}

	$scope.ajax = {
		busy : false
	}
	$scope.submit = function(form, opt_section){
		$scope.ajax.busy = true;
		TrainerFactory.save(opt_section).then(function(){
			$scope.ajax.busy = false;
			$scope.editing = false;
			AlertMessage.success("Profile updated successfully");
		}).catch(function(err){
			$scope.ajax.busy = false;
			FormControl.parseValidationErrors(form, err);
		})
	}

	// Privacy Popover Related Functions, can probably separate these into another controller
	var privacyPopover;

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
})
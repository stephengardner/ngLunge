myApp.controller("TrainerInfoController", function(TrainerFactory, AlertMessage, socket, FormControl, $popover, Sync, $scope, Auth){

	$scope.editingPrivacyFor = false;

	//$scope.isMe = TrainerFactory.isMe;

	$scope.trainerFactory = TrainerFactory;
	//$scope.trainerEditing2 = TrainerFactory.trainer_editing;

	// BEGIN controller syncing
	/*
	// note - The fastest way to completely sync trainer and trainer editing with the socket events, and changes within
	// note - the controller when the controller updates something
	function initAndSync(user){
		// Set trainer and trainerEditing on the sync object, then put them on the scope
		Sync.syncTrainer(user);
		$scope.trainer = Sync.trainer;
		$scope.trainerEditing = Sync.trainerEditing;

		// Get notified by the socket for updates on this user, when updates happen, sync the trainer
		socket.sync.user('trainer', user,  function(event, newTrainer){
			Sync.syncTrainer(newTrainer);
			AlertMessage.success("Profile updated successfully");
		});

		// the Sync service will emit a trainerUpdated event, which re-syncs this scope
		$scope.$on('trainerUpdated', function(){
			$scope.trainer = Sync.trainer;
			$scope.trainerEditing = Sync.trainerEditing;
		});
	};
	*/

	$scope.isMe = function(){
		return TrainerFactory.isMe() || ($scope.trainer && $scope.trainer._id == Auth.getCurrentUser()._id);
	};

	// Sync the user up. and we're good to go!
	Auth.isLoggedInAsync(function(){
		TrainerFactory.init(Auth.getCurrentUser()), { sync : true } ;
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
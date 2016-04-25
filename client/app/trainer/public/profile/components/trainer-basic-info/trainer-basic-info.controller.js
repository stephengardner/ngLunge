lungeApp.controller("TrainerBasicInfoController", function(ngDialog, $document, $popover, FormControl, AlertMessage,
                                                           $window, Geocoder, $timeout, $q, Auth, $scope){
	// Necessary, remove err on keyup
	$scope.removeMongooseError = FormControl.removeMongooseError;

	$scope.busy = function(){
		return $scope.ajax.basicInfo;
	};
	var locationPopover = $popover(angular.element("#location-popover"), {
		contentTemplate: $scope.popovers.location.templateUrl,
		html: true,
		trigger: 'click',
		animation : 'am-flip-x',
		placement : 'left',
		autoClose: true
	});

	function bindStatePopover() {
		if(statePopover)
			return false;
		var statePopover = $popover(angular.element("#state-popover"), {
			contentTemplate: $scope.popovers.helpTemplate.templateUrl,
			html: true,
			trigger: 'click',
			animation : 'am-flip-x',
			placement : 'left',
			title : 'State Help',
			content : 'Lunge currently operates in DC, MD, and VA.',
			autoClose: true
		});
	}

	$scope.basicInfo = {
		visible : false,
		toggle : function(){
			if(this.visible)
				this.hide();
			else
				this.show();
		},
		show : function() {
			this.visible = true;
		},
		hide : function() {
			this.visible = false;
		}
	};

	$scope.contactModal = function() {
		$scope.modal = ngDialog.open({
			template: "app/trainer/public/profile/components/contact-modal/trainer-contact-modal.partial.html",
			scope: $scope,
			className: 'ngdialog-theme-default large',
			controller: "TrainerContactModalController",
			showClose : false
		});
	};
	// Tracks if manual location has been toggled on or off
	$scope.manualLocation = {
		isActive : function(){
			return this.active;
		},
		toggle : function(){
			this.active = !this.active;
			if(this.active) {
				$timeout(function(){
					bindStatePopover();
				}, 1000);
			}
		},
		init : function() {
			if($scope.trainer && $scope.trainer.location.type == "manual") {
				this.active = true;
			}
		},
		active : false
	};
	$scope.manualLocation.init();

	// primarily used for setting linkedin, facebook, etc, back to default.
	// since the model looks at trainerEditing for this
	$scope.cancelProviderChanges = function() {
		$scope.trainerEditing = angular.copy($scope.trainer);
	};

	$scope.updateBasicInfo = function(form) {
		// ajax.basicInfo says if form is being uploaded
		$scope.ajax.basicInfo = true;
		$scope.submitted = true;
		console.log("Updating basic info");
		if(form.$invalid) {
			console.log("Form Invalid", form);
			form.$setPristine();
			$scope.ajax.basicInfo = false;
			return false;
		}

		var deferred = $q.defer();
		var location;
		if($scope.manualLocation.isActive()) {
			$scope.trainerEditing.location.type = "manual";
		}
		else {
			$scope.trainerEditing.location = $scope.updatedLocation;
			if($scope.trainerEditing.location)
				$scope.trainerEditing.location.type = false;
		}

		var dataToSend = {
			name : { full : $scope.trainerEditing.name.full },
			bio: $scope.trainerEditing.bio,
			location : $scope.trainerEditing.location,
			linkedin : $scope.trainerEditing.linkedin,
			facebook : $scope.trainerEditing.facebook,
			twitter : $scope.trainerEditing.twitter,
			google : $scope.trainerEditing.google
		};

		// set primary location so that when we add to the locations array we can tag this as our home gym/office
		if(dataToSend.location && dataToSend.location.state) {
			dataToSend.location.primary = true;
			dataToSend.location.title = "Main Location";
		}

			$scope.sending = true;
			Auth.updateProfile(dataToSend).then(function(response){
				$scope.ajax.basicInfo = false;
				AlertMessage.success("Profile updated successfully");
				$scope.sending = false;
				// I don't need to automatically update the trainer because the push notification from Node is
				// already calling syncTrainer, and therefore my properties are completely updated... nice huh
				deferred.resolve(true);
			}).catch(function(err) {
				$scope.ajax.basicInfo = false;
				$scope.sending = false;
				FormControl.parseValidationErrors(form, err);
				$scope.errors = FormControl.errors;
				//$scope.$apply();
				deferred.reject();
			});
		return deferred.promise;
	};

	Geocoder.bindPlaces("#location-google", function(updatedLocation){
		$scope.updatedLocation = updatedLocation;
		$scope.$apply();
	});

	/* // DO NOT DELETE
	$(function(){
		if(google) {
			var trainerLocation = $("#trainer-location").geocomplete({blur : true}).on("geocode:result", function(event, result){
				$scope.$apply(function(){
					$scope.updatedLocation = Geocoder._unwrapAddressComponents(result);
					$scope.updatedLocation.google = {
						placesAPI : {
							formatted_address : result.formatted_address
						}
					}
					console.log($scope.updatedLocation);
				});
			});
		}
		//trainerLocation
	});
	*/
});
lungeApp.controller("TrainerBasicInfoController", function(AlertMessage, $window, $timeout, Geocoder, $timeout, $q, Auth, $scope){
	$scope.isValidName = function(value){
		console.log("TESTING:",value);
		console.log("Returning: " , test);
		return test;
	};
	$scope.isAjax = function(){
		return $scope.ajax.basicInfo;
	};
	$scope.validator = {
		preCheck : function(){
			// it's alwasy valid if the form has not been submitted
			return false;//!$scope.submitted;
		},
		name : function($value, opt_ignorePreCheck) {
			if(!opt_ignorePreCheck && this.preCheck() == true) {
				return true;
			};
			return $value != "a";
		},
		bio : function($value, opt_ignorePreCheck) {
			if(!opt_ignorePreCheck && this.preCheck() == true) {
				return true;
			};
			return !$value || $value.length < 300;
		},
		city : function($value, opt_ignorePreCheck) {
			if(!opt_ignorePreCheck && this.preCheck() == true) {
				return true;
			};
			return $value && $value.length > 2;
		},
		state : function($value, opt_ignorePreCheck) {
			if(!opt_ignorePreCheck && this.preCheck() == true) {
				return true;
			};
			return $value == "DC" || $value == "MD" || $value == "VA";
		},
		zipcode : function($value, opt_ignorePreCheck) {
			console.log("ignoring pre check?", opt_ignorePreCheck);
			if(!opt_ignorePreCheck && this.preCheck() == true) {
				console.log("bagging it");
				return true;
			};
			console.log("testing ", $value, " and returning: ", /(^\d{5}$)|(^\d{5}-\d{4}$)/.test($value))
			return /(^\d{5}$)|(^\d{5}-\d{4}$)/.test($value);
		}
	}
	$scope.basicInfo = {
		visible : false,
		toggle : function(){
			this.visible = !this.visible;
		},
		hide : function() {
			this.visible = false;
		}
	};

	$scope.isProviderEditing = function(provider) {
		// check if the provider is in the process of being edited.
		// If it is, disable the ability to authenticate it, because it's not technically edited yet.
		return $scope.trainer[provider] != $scope.trainerEditing[provider];
	}
	$scope.manualLocation = {
		isActive : function(){
			return this.active;
		},
		toggle : function(){
			console.log($scope.basicInfo2);
			this.active = !this.active;
			//console.log("===============================>", $scope.basicInfo2.something);//.$setValidity('mongoode', false));
		},
		init : function() {
			console.log("manualLocation init(): Scope trainer:", $scope.trainer);
			if($scope.trainer && $scope.trainer.location.type == "manual") {
				this.active = true;
			}
		},
		active : false
	};
	$scope.manualLocation.init();
	$scope.removeMongooseError = function(form, inputName) {
		console.log("attempting...", form[inputName]);
		//$scope.submitted = false;
		if(!form[inputName] || !form[inputName].$error) {
			return false;
		}
		console.log("SETTING INVISIBLE TRUE FOR : ", inputName);
		form[inputName].$error['invisible'] = false;
		form[inputName].$setValidity('mongoose', true);
		form[inputName].$setValidity('invisible', true);
	};
	$scope.watchMongoose = function(inputName){
		if(!form[inputName].$error) {
			return true;
		}
		return !form[inputName].$error.mongoose;
	}
	$scope.cancelProviderChanges = function() {
		// primarily used for setting linkedin, facebook, etc, back to default.
		// since the model looks at trainerEditing for this
		$scope.trainerEditing = angular.copy($scope.trainer);
	}
	$scope.updateBasicInfo = function(form) {
		$scope.ajax.basicInfo = true;
		console.log("THE ENTIRE FORM ==============================", form);
		$scope.submitted = true;
		if(form.$invalid) {
			form.$setPristine();
			return false;
		}
		//form['name'].$setValidity('mongoose', false);
		//return "";
		var deferred = $q.defer();
		var dataToSend = {
			name : { full : form.name.$modelValue },
			bio: form.bio.$modelValue,
			location : $scope.updatedLocation,
			linkedin : $scope.trainerEditing.linkedin,
			facebook : $scope.trainerEditing.facebook,
			twitter : $scope.trainerEditing.twitter,
			google : $scope.trainerEditing.google
		};
		if($scope.manualLocation.isActive()){
			angular.extend(dataToSend, {
				location : {
					type : "manual",
					city : form.city.$modelValue,
					state : form.state.$modelValue,
					zipcode : form.zipcode.$modelValue
				}
			})
		}
		// set primary location so that when we add to the locations array we can tag this as our home gym/office
		if(dataToSend.location.state) {
			dataToSend.location.primary = true;
			dataToSend.location.title = "Main Location";
		}
		console.log("=========> SENDING: ", dataToSend);
		//if(form.$valid){
			$scope.sending = true;
			Auth.updateProfile(dataToSend).then(function(response){
				$scope.ajax.basicInfo = false;
				AlertMessage.success("Profile updated successfully");
				$scope.sending = false;
				console.log("updated: ", response);
				$scope.basicInfo.hide();
				$scope.syncTrainer(response);
				//$scope.trainer = response;
				//$scope.trainerEditing = angular.copy(response);
				deferred.resolve(true);
			}).catch(function(err) {
				$scope.ajax.basicInfo = false;
				console.log("ERRRRRRRRRRR", err);
				form.$setPristine();
				err = err.data;
				$scope.sending = false;
				$scope.errors = {};
				// Update validity of form fields that match the mongoose errors
				angular.forEach(err.errors, function(error, field) {
					//$scope.basicInfo.$setError(field, error.message);
					console.log("Field is: ", field, " and scope basicInfo.visible: ", $scope.basicInfo.visible);
					if((field == "zipcode" || field == "state" || field == "city") && !$scope.manualLocation.isActive()) {
						console.log("Setting location validity false");
						form['location'].$setValidity('mongoose', false);
					}
					else {
						console.log("Setting form[" + field + "].$dity = false");
						form[field].$dirty = false;//('mongoose', false);
						console.log(form[field]);
						form[field].$setValidity('mongoose', false);
						$scope.errors[field] = error.message;
					}
					deferred.reject();
				});
			});
		return deferred.promise;
	};

	Geocoder.bindPlaces("#trainer-location", function(updatedLocation){
		$scope.updatedLocation = updatedLocation;
		$scope.$apply();
	});
	/*
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
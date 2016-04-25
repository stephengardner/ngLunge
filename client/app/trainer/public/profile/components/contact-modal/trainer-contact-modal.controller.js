
lungeApp.controller("TrainerContactModalController",
	function($scope, $http, FormControl, AlertMessage){
		$scope.inquiry = {
			user : {
				name : {
				}
			}
		};
		$scope.errorMessages = {
			name : {
				invalid : 'Please use a valid first name'
			},
			email : {
				invalid : 'Please enter a valid email address'
			},
			comment : {
				empty : 'Please leave a message for ' + $scope.trainerFactory.trainer.name.first,
				too_long : 'Please limit your message to 1000 characters'
			}
		}
		$scope.validateFirstName = function(value) {
			var modelValue = value.$modelValue;
			console.log("Validating name:", modelValue);
			if(modelValue && modelValue.length && modelValue.length > 1) {
				value.$setValidity("mongoose", true);
				return true;
			}
			value.$setValidity("mongoose", false);
			value.$error.mongoose = $scope.errorMessages.name.invalid;
		}
		$scope.validateEmail = function(value) {
			var modelValue = value.$modelValue;
			console.log("Validating email:", modelValue);
			if(modelValue && modelValue.indexOf('@') != -1) {
				value.$setValidity("mongoose", true);
				return true;
			}
			value.$setValidity("mongoose", false);
			value.$error.mongoose = $scope.errorMessages.email.invalid;
		}
		$scope.validateComment = function(value) {
			var modelValue = value.$modelValue;
			console.log("Validating comment:", modelValue);
			if(modelValue && modelValue.length > 0 && modelValue.length <= 1000) {
				value.$setValidity("mongoose", true);
				return true;
			}
			value.$setValidity("mongoose", false);
			if(!modelValue || !modelValue.length) {
				value.$error.mongoose = $scope.errorMessages.comment.empty;
			}
			else if(modelValue.length > 1000) {
				value.$error.mongoose = $scope.errorMessages.comment.too_long;
			}
		}
		$scope.send = function(form) {
			$scope.validateFirstName(form.firstName);
			$scope.validateEmail(form.email);
			$scope.validateComment(form.comment);
			if(!form.$valid) {
				return false;
			}
			$scope.globalAjax.busy = $http({
				method : 'POST',
				url : 'api/trainers/contact',
				data : {
					trainer : $scope.trainerFactory.trainer,
					inquiry : $scope.inquiry
				}
			}).then(function(data){
				console.log("Response:", data);
				AlertMessage.success('Your message has been sent to ' + $scope.trainerFactory.trainer.name.first);
				$scope.closeThisDialog(true);
			}, function(err){
				if(err.status && err.status == 500) {
					AlertMessage.error(err.data ? err.data.message : 'Something went wrong...');
				}
				if(err.status && err.status == 429) {
					AlertMessage.error('You\'ve sent too many messages recently, please wait a moment and try again');
				}
				FormControl.parseValidationErrors(form, err);
				console.log("Err:", err);
			})
		}
	});
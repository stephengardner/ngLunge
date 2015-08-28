lungeApp.controller("ProfilePictureController", function(ScrollLock, ngDialog, FormControl, AlertMessage, ProfilePicture, $scope, $timeout, $document, $window){

	$scope.ProfilePicture = ProfilePicture;
	$scope.validate = function(){
	}
	function scrollToProfilePicture() {
		var profilePictureDiv = angular.element(document.getElementById('profile-picture'));
		$document.scrollToElement(profilePictureDiv, 100, 600);
	}
	$scope.cancelCrop = function(){
		ProfilePicture.removeImage();
		scrollToProfilePicture();
	};
	$scope.selectFile = function(){
		console.log("Selecting file");
		$timeout(function(){
			$("#upload_input").click();
		}, 100);
	};
	$scope.$watch('profilePictureErrors', function(newValue, oldValue){
		console.warn("Changing form :", oldValue, " to: ", newValue);
	});
	function profilePictureModal(imageUrl) {
		$scope.imageUrl = imageUrl;
		$scope.modal = ngDialog.open({
			template: "components/profile-picture/modal/profile-picture-modal.html",
			scope: $scope,
			controller: "ProfilePictureModalController",
			showClose : false,
			className: 'ngdialog-theme-fullscreen'
		});
		$scope.modal.closePromise.then(function(data) {
			ScrollLock.unlock();
			$scope.modal = false;
		})
	};

	$scope.onFileSelect = function($files) {

		console.log("Scope onFileSelect");

		// Validate the file uploading
		for (var i = 0; i < $files.length; i++) {
			if ($files[i].type.indexOf('image') === -1)
				return AlertMessage.error("Only image files are allowed as your profile picture", { closeButton : true });
		}
		if(ProfilePicture.jcrop_api) {
			ProfilePicture.jcrop_api.release();
			ProfilePicture.jcrop_api.disable();
			$scope.imgSelection = false;
		}
		if($files) {
			ProfilePicture.onFileSelect($files).then(function(response){
				if(!$scope.modal) {
					$timeout(function(){
						ProfilePicture.setImage(response.data.url).then(function(){
							profilePictureModal(response.data.url);
						});
					});
				}
			}, function(err){
				console.log("Error is:" ,err);
				try {
					AlertMessage.error(err.data.errors.file.message, {closeButton : true });
				}
				catch(err) {
					AlertMessage.error("There was a problem processing this file", { closeButton : true });
				}
			}).catch(function(err) {
				console.log("profile picture upload exception:", err);
			});
		}
		else {
			ProfilePicture.removeImage();
			console.log("Image select cancelled");
		}
	};
})
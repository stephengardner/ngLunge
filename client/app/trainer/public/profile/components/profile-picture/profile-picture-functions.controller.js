lungeApp.controller("ProfilePictureController", function(ScrollLock,
                                                         ngDialog,
                                                         FormControl,
                                                         AlertMessage,
                                                         ProfilePicture,
                                                         $scope,
                                                         $timeout,
                                                         $document,
                                                         $window,
                                                         Upload
){

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

	// NEW profile picture model
	$scope.fileModel = {
		file : undefined
	};

	//$scope.selectFile = function(){
	//	console.log("Selecting file");
	//	$timeout(function(){
	//		$("#upload_input").click();
	//	}, 100);
	//};
	$scope.fileChanged = function(form, files, file) {
		console.log("FILE:", file);
		FormControl.removeMongooseError(form, 'file');
		if(file && file.name) {
			$scope.fileModel.name = file.name;
			console.log("FILES:", files);
			$scope.onFileSelect(files);
		}
	};

	$scope.toggleChooseFile = function(form){
		console.log("CLICKED");
		if($scope.fileModel.file && $scope.fileModel.file.name) {
			$scope.fileModel.file = undefined;
			FormControl.removeMongooseError(form, 'file');
		}
		else {
			$("#file").trigger('click');
		}
	};

	function profilePictureModal(imageUrl) {
		$scope.imageUrl = imageUrl;
		console.log("opening modal with image url:", imageUrl);
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
			console.log("calling onFileSelect for ProfilePicture with files:", $files);
			ProfilePicture.onFileSelect($files).then(function(response){
				console.log("Response:", response);
				if(!$scope.modal) {
					$timeout(function(){
						ProfilePicture.setImage(response.data.path).then(function(){
							profilePictureModal(response.data.path);
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
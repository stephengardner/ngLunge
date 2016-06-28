lungeApp.controller("TrainerProfilePictureController", function(FormControl,
                                                         AlertMessage,
                                                         ProfilePicture,
                                                         $scope,
                                                         $timeout,
                                                         $document,
                                                         $window,
                                                         Upload,
                                                         $mdDialog,
                                                         $q,
                                                                $mdMedia
){

	$scope.ProfilePicture = ProfilePicture;

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

	$scope.fileChanged = function(form, files, file) {
		FormControl.removeMongooseError(form, 'file');
		if(file && file.name) {
			$scope.fileModel.name = file.name;
			$scope.globalAjax.busy = $scope.onFileSelect(files).then(fileChangeSuccess).catch(fileChangeError);
		}
		else {
			console.log("fileChanged had no file... This bug fires, find out why");
			// AlertMessage.error('No file selected');
		}
	};

	function fileChangeSuccess(response){
		ProfilePicture.setImage(response.data.path).then(function(){
			profilePictureModal(response.data.path);
		});
	}
	function fileChangeError(err) {
		try {
			ProfilePicture.removeImage();
			if(err.message = 'bad image type') {
				AlertMessage.error("Only image files are allowed as your profile picture", { closeButton : true });
			}
			else {
				AlertMessage.error(err.data.errors.file.message, {closeButton : true });
			}
		}
		catch(err) {
			AlertMessage.error("There was a problem processing this file", { closeButton : true });
		}
	}

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

	$scope.saveClickEventForModal = function($event) {
		$scope.clickEventForModal = $event;
	};

	function profilePictureModal(imageUrl, ev) {
		$scope.imageUrl = imageUrl;
		var parentEl = angular.element(document.body);
		$mdDialog.show({
			parent: parentEl,
			clickOutsideToClose : true,
			controller : 'ProfilePictureModalController',
			templateUrl : 'components/profile-picture/modal/profile-picture-modal.html',
			targetEvent : $scope.clickEventForModal
		}).then(function(response){
			
		}, function(err){
			
		});
	}

	function checkImageType($files) {
		for (var i = 0; i < $files.length; i++) {
			if ($files[i].type.indexOf('image') === -1)
				return false;
		}
		return true;
	}

	$scope.onFileSelect = function($files) {
		return new $q(function(resolve, reject) {
			if(ProfilePicture.jcrop_api) {
				ProfilePicture.jcrop_api.release();
				ProfilePicture.jcrop_api.disable();
				$scope.imgSelection = false;
			}
			if($files) {
				// Validate the file uploading
				if(!checkImageType($files)) return reject(new Error('bad image type'));
				ProfilePicture.onFileSelect($files).then(resolve).catch(reject);
			}
			else {
				return reject();
			}
		})
	};
});
lungeApp.controller("ProfilePictureController", function(AlertMessage, ProfilePicture, $scope, $timeout, $document, $window){
	$scope.ProfilePicture = ProfilePicture;
	$scope.saveCrop = function(){
		ProfilePicture.saveCrop().then(function(response){
			$scope.trainer = response;
			var someElement = angular.element(document.getElementById('profile-picture'));
			$timeout(function(){
				$document.scrollToElement(someElement, 80, 600);
				$scope.$apply();
			}, 100);
		}, function(){
			AlertMessage.error("Image upload failed.  There may be a problem with your image or internet connection.",
				{closeButton : true})
		});
	};

	$scope.selectFile = function(){
		$("#upload_input").click();
	}
	$scope.onFileSelect = function($files) {
		console.log("Scope onFileSelect");
		if($files) {
			ProfilePicture.onFileSelect($files).then(function(){
				$scope.imgSelection = true;

				ProfilePicture.attachImgAreaSelect($("#imgLoaded"), function(coords){
					ProfilePicture.attachPreview($('.registration-specific-image-placeholder'), coords);
					$timeout(function(){
						var loadedImage = angular.element(document.getElementById('imgLoaded'));
						$document.scrollTo(loadedImage, 200, 500);
					})
				});
			})
		}
		else {
			console.log("Image select cancelled");
		}
	};
	angular.element($window).bind('resize', function(){
		ProfilePicture.attachPreview($('.registration-specific-image-placeholder'));
		$scope.$apply();
	});
})
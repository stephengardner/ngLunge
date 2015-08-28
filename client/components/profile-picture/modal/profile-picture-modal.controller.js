myApp.controller("ProfilePictureModalController", function($interval, ScrollLock, AlertMessage, $timeout, ngDialog, ProfilePicture, $scope){
	var intervalChecks = 0;

	// Attach jCrop after the image has loaded from the ng-src event.
	// we can check directly on ng-src, but I'm going to do it here.
	// if the image takes longer than 5 seconds to load, throw an error message out
	$scope.interval = $interval(function(){
		intervalChecks++;
		if(intervalChecks >= 50) {
			AlertMessage.error("There was a problem uploading your image, please try a different one", {closeButton : true});
			$interval.cancel($scope.interval);
			ProfilePicture.removeImage();
			$scope.closeThisDialog(false);
		}
		else {
			intervalChecks = 0;
			var element = document.getElementById("imgLoaded");
			if(element && element.complete && element.naturalWidth) {
				$interval.cancel($scope.interval);
				ProfilePicture.attachJCrop($("#imgLoaded"), function (coords) {
					console.log("Coords:", coords);
				});
			}
		}
	}, 100);

	// Lock the page to show this modal
	ScrollLock.lock();

	// Crop and save the image to the server, then close the modal
	$scope.saveCrop = function(){
		ProfilePicture.saveCrop().then(function(response){
			// $scope.trainer does NOT need to be updated because it will be automatically updated by parent sync
			$scope.closeThisDialog(response);
			ProfilePicture.removeImage();
			AlertMessage.success("Profile picture updated successfully!");
		}, function(){
			$scope.closeThisDialog(false);
			ProfilePicture.removeImage();
			AlertMessage.error("Image upload failed.  There may be a problem with your image or internet connection.",
				{closeButton : true})
		});
	};
});
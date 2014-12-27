lungeApp.controller("UploadController", function($timeout, $http, $scope, $upload) {
	$scope.onFileSelect = function ($files) {
		$scope.profile.picture.url = false;
		var file = $files[0];
		$scope.file = file;
		// data to post with the picture, was originally formatted for data s3 needs, but that has since been changed
		var dataToPost = {
			key: 'profile-pictures/trainers/' + file.name,
			acl: 'public-read',
			"Content-Type": file.type === null || file.type === '' ?
				'application/octet-stream' : file.type,
			filename: file.name
		};

		// define the upload scope variable
		$scope.upload = $upload.upload({
			url : '/api/aws/upload',
			method : 'POST',
			data : dataToPost,
			file : file
		});

		// upload the picture!
		$scope.upload.then(function(response){
			$scope.selection = false;
			$scope.cropping = true;
			// create the image preview, when the image loads, show the image preview (for cropping).
			var img = new Image();
			img.src = response.data.url;
			img.onload = function() {
				$scope.resizeImagePreview();
				$scope.profile.picture.url = response.data.url;
				$scope.attachImgAreaSelect($("#imgLoaded"));
				$scope.$apply();
			};

		}, function(response) {
			console.log("-------- error:", response);
			if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
		}, function(evt) {
			console.log("-------- progress:", evt);
			$scope.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
		});
	};

	$scope.saveCrop = function(){
		console.log("cropping using the file: ", $scope.file);
		$http.post('/api/aws/crop', {filepath : $scope.profile.picture.url, coords : $scope.coords}).success(function(response){
			$scope.cropping = false;
			console.log("Success cropping photo!");
			console.log(response);
		});
		console.log("Saving the selection: ", $scope.coords);
	};

});
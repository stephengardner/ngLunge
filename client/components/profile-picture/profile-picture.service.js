// Documentation on this rather confusing Service:
/*
 * coords must end up being:
 * x1, y1, width, imageWidth, imageHeight
 * x1 : the position of the top left X crop bounding
 * y1 : the position of the top left Y crop bounding
 * width : the width of the square bounding box
 * imageWidth / imageHeight : dimensions of the smaller preview that the original file sits in.
 */
lungeApp.factory("ProfilePicture", function($timeout, Auth, $timeout, $http, $q, Upload /*$upload*/){
	var ProfilePicture = {
		url : false,
		file : false,
		selection : false,
		cropping : false,
		image : {
			url : "",
			selection : false
		},
		preview : {
			wrapper : {
				maxWidth : false,
				maxHeight : false
			}
		},

		/**
		 * set the selection of the cropping space to be a square bounded by either the height or width, and centered
		 * if the image turns out to be a square, select the inner portion of it by 10% around the outside
		 * @returns {*[]}
		 */
		getSquareBounding : function() {
			var imgLoaded = $("#imgLoaded"),
				imageLoadedWidth =  imgLoaded.width(),
				imageLoadedHeight = imgLoaded.height(),
				selectionSize = imageLoadedWidth > imageLoadedHeight ? imageLoadedHeight : imageLoadedWidth,
				x1 = imageLoadedWidth/2 - (selectionSize/2),
				y1 = imageLoadedHeight/2 - (selectionSize/2),
				x2 = x1 + selectionSize,
				y2 = y1 + selectionSize;

			// if the image is a square, shrink resulting coordinates so that the user can see the cropping area.
			if(imageLoadedHeight == imageLoadedWidth) {
				x1 = imageLoadedWidth * .1;
				y1 = imageLoadedHeight * .1;
				x2 *= .9;
				y2 *= .9;
			}
			return [x1, y1, x2, y2];
		},
		showImage : function() {
			ProfilePicture.attached = true;
		},
		// Remove the cropping box and image cropping section
		removeImage : function() {
			$timeout(function(){
				//$("#upload_input")[0].value = "";
				ProfilePicture.image = {}; // this removes the preview
				ProfilePicture.attached = false;
			});
		},
		attachJCrop : function(element, cb) {
			var cb = cb ? cb : angular.noop;
			this.jCrop = element;
			var self = this;
			ProfilePicture.showImage();
			//$timeout(function() {
			//ProfilePicture.updateMaxImageSize();
			console.log("Width: ", this.width, " Height: ", this.height);
			console.log("ProfilePicture.attachJCrop(", element, ")");
			//});
			function setCoords(coords) {
				console.log("The coords are: ", coords);
				// re-name these to x1 and y1, for use later
				coords.x1 = coords.x;
				coords.y1 = coords.y;
				coords.width = coords.w;
				coords.height = coords.h;

				coords.imageHeight = ProfilePicture.jCrop.height(); // element == $("#imgLoaded");
				coords.imageWidth = ProfilePicture.jCrop.width();
				ProfilePicture.selection = coords;

			};
			if(this.jcrop_api) {
				console.log("Setting new jcrop image:", this.image.url);
				//this.jcrop_api.destroy();//setImage(this.image.url);
			}

			console.log("THE IMAGE WIDTH AND HEIGHT:", this.image.element.width, " , ", this.image.element.height);

			this.jcrop_api = $.Jcrop($(element), {
				keySupport: false,
				aspectRatio: 1/1,
				onChange: setCoords,
				onSelect: setCoords,
				setSelect:   ProfilePicture.getSquareBounding()
				//,boxWidth : this.width
				// ,boxHeight : this.height
				//,trueSize: [this.width, this.height]
			});
		},

		// set the size of the profile picture within the modal
		// only set this once, we're not worrying about browser resizing
		// this function makes use of the original image ratio and the screen ratio and makes sure it fits
		// within the specified parameters ( screen width - 40, screen height - 110 ), also bounded by max width 500
		updateMaxImageSize : function(){
			var w, h;

			// bound width by screen and height by screen
			w = $(window).width() - 40;
			h = $(window).height() - 110;

			var maxWidth = 500;
			var maxHeight = h;
			console.log("w:", w, " h: ", h);
			// max width 500px
			w = w > maxWidth ? maxWidth : w;
			console.log("w:", w, " h: ", h);
			// note the lesser dimension
			var windowLesserDimension = w > h ? h : w;

			console.log("The image ratio is:", this.image.ratio);
			console.log("The lesser dimension by which we will bound the image is:", windowLesserDimension + "px");
			// set pixels based on screen and image ratios
			if(windowLesserDimension == w) {
				if(this.image.ratio >= 1) {
					console.log("lesser is width, and the image ratio >= 1");
					this.height = "auto";
					this.width = windowLesserDimension;
				}
				else {
					console.log("lesser is width, and the image ratio < 1");
					var newRatio = this.image.ratio / (w/h);
					this.height = "auto";
					this.width = (newRatio * windowLesserDimension) > maxWidth ? maxWidth : newRatio * windowLesserDimension;
				}
			}
			else {
				console.log("Lesser is not w");
				if(this.image.ratio >= 1) {
					var newRatio = (w/h) / this.image.ratio;
					this.width = "auto";
					this.height = (newRatio * windowLesserDimension) > maxHeight ? maxHeight : newRatio * windowLesserDimension;
				}
				else {
					this.width = "auto";
					this.height = windowLesserDimension;
				}
			}
			console.log("after updating max image size, this.width is :", this.width, " and this.height is:", this.height);
		},

		// Loads the image URL and returns a promise when done
		setImage : function(imageUrl) {
			console.log("Setting image using imageUrl: ", '\\' + imageUrl);
			var deferred = $q.defer();
			// create the image preview, when the image loads, show the image preview (for cropping).
			var img = new Image();
			img.src = '\\' + imageUrl;
			img.onload = function() {
				console.log("Setting image: image Set and loaded.");
				ProfilePicture.image.element = img;
				ProfilePicture.image.url = imageUrl;
				ProfilePicture.image.selection = false;
				ProfilePicture.status = "loaded";
				ProfilePicture.image.ratio = this.width / this.height;

				ProfilePicture.updateMaxImageSize();
				$timeout(function(){
					deferred.resolve();
				});
			};
			img.onerror = function(err){
				console.log(err);
				deferred.reject(err);
			}
			return deferred.promise;
		},

		// When files have been selected by the user, upload them and return a promise
		onFileSelect : function($files){
			console.log("onFileSelect files:", $files);
			var deferred = $q.defer(),
				file = $files[0];
			ProfilePicture.status = "loading";
			ProfilePicture.file = file;

			// data to post with the picture, was originally formatted for data s3 needs, but that has since been changed
			var dataToPost = {
				key: 'profile-pictures/trainers/' + file.name,
				acl: 'public-read',
				"Content-Type": file.type === null || file.type === '' ?
					'application/octet-stream' : file.type,
				filename: file.name,
				file : file
			};

			//Auth.getCurrentUser(function(currentUser){
			file.upload = Upload.upload({
				url : '/api/trainers/' + Auth.getCurrentUser()._id + '/profile-picture/local',
				method : 'POST',
				data : dataToPost
			})
			// define the upload scope variable
			//var upload = $upload.upload({
			//	url : '/api/aws/upload',
			//	method : 'POST',
			//	data : dataToPost,
			//	file : file
			//});

			// upload the picture!
			console.log("ProfilePicture.file is:", ProfilePicture.file);
			file.upload.then(function(response){
				if(response.status == 200 && response.data) {
					deferred.resolve(response);
				}
				else {
					ProfilePicture.status = "err";
					//ProfilePicture.file = response.data;
					deferred.reject(response);
				}
			}, function(response) {
				ProfilePicture.status = "err";
				deferred.reject(response);
			}, function(evt) {
				console.log("-------- progress:", evt);
				ProfilePicture.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
			}).catch(function(err){
				console.log("Caught err in upload:", err);
				deferred.reject(err);
			});
			//})

			return deferred.promise;
		},

		saveCrop : function() {
			var deferred = $q.defer();
			ProfilePicture.status = "cropping";
			var dataToPost = {
				url : ProfilePicture.image.url,
				coords : ProfilePicture.selection
			};
			console.log("POSTING DATA:", dataToPost);
			$http({
				method : 'POST',
				url : '/api/trainers/' + Auth.getCurrentUser()._id + '/profile-picture/s3',
				data : dataToPost
			}).success(function(data){
				ProfilePicture.status = "cropped";
				console.log("data:", data);
				ProfilePicture.removeImage();
				deferred.resolve(data);
			}).error(function(err){
				console.log(err);
				ProfilePicture.status = "err";
				deferred.reject(err);
			})
			return deferred.promise;
		}
	};
	return ProfilePicture;
})
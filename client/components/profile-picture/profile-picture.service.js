lungeApp.factory("ProfilePicture", function(Auth, $timeout, $http, $q, $upload){
	var ProfilePicture = {
		url : false,
		file : false,
		selection : false,
		cropping : false,
		preview : {
			wrapper : {
				maxWidth : false,
				maxHeight : false
			}
		},
		image : false,
		updateOnResize : function() {

		},
		attachPreview : function(attachTo, selection) {
			var selection = selection ? selection : ProfilePicture.selection;
			console.log("--------------- preview -----------------");
			var coords;
			coords = selection;
			coords.imageHeight = this.image.height(); // element == $("#imgLoaded");
			coords.imageWidth = this.image.width();
			console.log("this image width is: ", this.image.width());
			console.log("this attachTo width is: ", $(attachTo).width());
			var scaleX = $(".profile-picture").width() / selection.width;
			var scaleY = $(".profile-picture").outerHeight() / selection.height;
			var newCss = {
				width: Math.round(scaleX * this.image.width()) + 'px',
				height: Math.round(scaleY * this.image.height()) + 'px',
				marginLeft: '-' + Math.round(scaleX * selection.x1) + 'px',
				marginTop: '-' + Math.round(scaleY * selection.y1) + 'px'
			};
			console.log("new css is: ", newCss);
			attachTo.css(newCss);
			$timeout(function(){
				ProfilePicture.scaled = true;
			}, 500);
			//alert("TRUE");
		},
		getSquareBounding : function(element) {
			var width = element.width();
			var height = element.height();
			var coords;
			if(width > height) {
				var diff = width - height;
				coords = {
					x1 : diff / 2,
					x2 : width - (diff / 2),
					y1 : 0,
					y2 : height
				}
			}
			else {
				var diff = height - width;
				coords = {
					x1 : 0,
					x2 : width,
					y1 : diff / 2,
					y2 : height - (diff / 2)
				}
			}
			coords.height = coords.y2 - coords.y1;
			coords.width = coords.x2 - coords.x1;
			console.log("-0- square bounding box: ", coords);
			return coords;
		},
		showImage : function() {
			$timeout(function(){
				ProfilePicture.attached = true;
			})
		},
		removeImage : function() {
			$timeout(function(){
				$("#upload_input")[0].value = "";
				ProfilePicture.attached = false;
				ProfilePicture.imgAreaSelect.cancelSelection();
			});
		},
		attachImgAreaSelect : function(element, cb) {
			var cb = cb ? cb : angular.noop;
			this.image = element;
			ProfilePicture.showImage();
			$timeout(function(){
				ProfilePicture.updateMaxImageSize();
				var coords = ProfilePicture.getSquareBounding(element);
				ProfilePicture.selection = coords;
				ProfilePicture.imgAreaSelect = element.imgAreaSelect({
					handles: true,
					aspectRatio : "1:1",
					instance: true,
					onSelectStart: function(element, selection){
						//$scope.selection = false;
					},
					onSelectEnd: function(element, selection){
						console.log("------------- ONSELECTEND ---------------");
						var newSelection = angular.copy(selection);
						$.each(selection, function(key, val) {
							//newSelection[key] = val * 2.75;
						});
						ProfilePicture.selection = selection;
						console.log("newselection is:", newSelection);
						ProfilePicture.attachPreview($('.registration-specific-image-placeholder'), selection);
					},
					x1 : coords.x1,
					x2 : coords.x2,
					y1 : coords.y1,
					y2 : coords.y2
				});
				cb(coords);
			})
		},
		updateMaxImageSize : function(){
			var maxWidth = $(".trainer-card").width() + "px",
				maxHeight = $(".profile-picture").outerHeight() + "px";
			console.log("updating maxImageSize:", maxWidth, "px, ", maxHeight, "px");
			ProfilePicture.image.css("maxWidth", maxWidth);
			ProfilePicture.image.css("maxHeight", maxHeight);
			console.log("this.images css:", ProfilePicture.image.css("maxHeight"), ProfilePicture.image.css("maxWidth"));
		},
		onFileSelect : function($files){
			console.log("onFileSelect()");
			ProfilePicture.status = "loading";// = true;
			var deferred = $q.defer();
			//ProfilePicture.url = false;
			var file = $files[0];
			ProfilePicture.file = file;
			// data to post with the picture, was originally formatted for data s3 needs, but that has since been changed
			var dataToPost = {
				key: 'profile-pictures/trainers/' + file.name,
				acl: 'public-read',
				"Content-Type": file.type === null || file.type === '' ?
					'application/octet-stream' : file.type,
				filename: file.name
			};

			// define the upload scope variable
			var upload = $upload.upload({
				url : '/api/aws/upload',
				method : 'POST',
				data : dataToPost,
				file : file
			});

			// upload the picture!
			upload.then(function(response){
				ProfilePicture.selection = false;
				ProfilePicture.status = "loaded";
				// create the image preview, when the image loads, show the image preview (for cropping).
				var img = new Image();
				img.src = response.data.url;
				ProfilePicture.url = response.data.url;
				alert(response.data.url);
				img.onload = function() {
					//ProfilePicture.url = response.data.url;
					deferred.resolve();
				};

			}, function(response) {
				console.log("-------- error:", response);
				if (response.status > 0) ProfilePicture.errorMsg = response.status + ': ' + response.data;
				deferred.reject();
			}, function(evt) {
				console.log("-------- progress:", evt);
				ProfilePicture.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
			});
			return deferred.promise;
		},
		saveCrop : function() {
			var deferred = $q.defer();
			ProfilePicture.status = "cropping";
			Auth.changeProfilePicture({filepath : ProfilePicture.url, coords : ProfilePicture.selection}, function(response){
				console.log("CHANGED");
				ProfilePicture.status = "cropped";
				console.log("Changed profile picture:",response);
				if(response) {
					deferred.resolve(response);
					ProfilePicture.removeImage();
				}
				else {
					deferred.reject(response);
				}
			}, function(err){
				deferred.reject(response);
				ProfilePicture.status = "err";
				console.log("err profile picture:",err);
			});
			return deferred.promise;
		}
	};
	return ProfilePicture;
})
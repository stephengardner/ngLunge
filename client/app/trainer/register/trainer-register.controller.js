lungeApp.controller("TrainerRegisterController", function($http, $timeout, $window, $scope){
	$scope.profile = {
		picture : {
		}
	};
	$scope.resizeImagePreview = function(){
		$scope.maxWidth = $(".registration").width() + "px";
		$scope.maxHeight = $(".profile-picture").outerHeight() + "px";
	};
	angular.element($window).bind('resize', function(){
		console.log("RS");
		$scope.resizeImagePreview();
		$scope.$apply();
	});

	$scope.uploadPhotoToServer = function(){
		$scope.upload
	};
	$scope.attachImgAreaSelect = function(){
		$timeout(function(){
			var width = $("#imgLoaded").width();
			var height = $("#imgLoaded").height();
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

			preview($("#imgLoaded"), coords);
			$("#imgLoaded").imgAreaSelect({
				handles: true,
				aspectRatio : "1:1",
				onSelectStart: function(element, selection){
					//$scope.selection = false;
				},
				onSelectEnd: function(element, selection){
					console.log("------------- ONSELECTEND ---------------");
					var newSelection = angular.copy(selection);
					$.each(selection, function(key, val) {
						newSelection[key] = val * 2.75;
					});
					console.log("newselection is:", newSelection);
					preview(element, selection);
				},
				x1 : coords.x1,
				x2 : coords.x2,
				y1 : coords.y1,
				y2 : coords.y2
			});
		});
		function preview(img, selection) {
			console.log("--------------- preview -----------------");
			$scope.coords = selection;
			$scope.coords.imageHeight = $("#imgLoaded").height();
			$scope.coords.imageWidth = $("#imgLoaded").width();
			var scaleX = $(".profile-picture").width() / selection.width;
			var scaleY = $(".profile-picture").width() / selection.height;
			var newCss = {
				width: Math.round(scaleX * $(img).width()) + 'px',
				height: Math.round(scaleY * $(img).height()) + 'px',
				marginLeft: '-' + Math.round(scaleX * selection.x1) + 'px',
				marginTop: '-' + Math.round(scaleY * selection.y1) + 'px',
				'backgroundImage' : "url('" + $scope.profile.picture.url + "')"
			};
			$scope.imgSelection = newCss;
			console.log("new css is: ", newCss);
			$scope.selection = true;
			$('.registration-specific-image-placeholder').css(newCss);
			//$scope.$apply();
		}
	};
});
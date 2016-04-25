lungeApp.directive('bgImage', function (ProfilePicture, $parse) {
	return {
		link: function(scope, element, attr) {
			attr.$observe('bgImage', function() {
				//console.log("----------------- the bg image changed so we should be setting the new profile picture to: ", attr.bgImage);
				//console.log(attr.bgImage);
				if (!attr.bgImage) {
					// No attribute specified, so use default
					//element.css("background-image","url("+scope.defaultImage+")");
				} else {
					var image = new Image();
					image.src = attr.bgImage;
					image.onload = function() {
						//Image loaded- set the background image to it
						element.css("background-image","url('"+attr.bgImage+"')");
						//console.log("bgImage onload");
						//scope.bgImage = attr.bgImage;
						scope.$emit("bgImage", attr.bgImage);
						//ProfilePicture.attachImgAreaSelect(element);
					};
					image.onerror = function() {
						//Image failed to load- use default
						element.css("background-image","url("+scope.defaultImage+")");
					};
				}
			});

		}
	};
});
lungeApp.directive("myStyle", function (){
	return {
		restrict: 'A',
		link: function(scope, element, attrs)
		{
			var el   = element[0];
			attr = attrs.myStyle;
			el.setAttribute('style', attr);

			// We need to watch for changes in the style in case required data is not yet ready when compiling
			attrs.$observe('myStyle', function (){
				attr = attrs.myStyle;
				if(attr)
				{
					console.log("setting style to:", attr);
					el.setAttribute('style', attr);
				}
			});
		}
	};
});
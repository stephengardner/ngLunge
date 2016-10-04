myApp.directive('agRatingStars', function(){
	return {
		restrict : 'AE',
		scope : {
			onMouseEnter : '&',
			onMouseLeave : '&',
			onHoverChanged : '&',
			static : '=',
			ngModel : '='
		},
		link : function(scope, element, attrs) {
			// console.log(scope);
			if(scope.onMouseEnter) {
				element.on('mouseenter', function () {
					scope.onMouseEnter();
				});
			}
			if(scope.onMouseLeave) {
				element.on('mouseleave', function () {
					scope.onMouseLeave();
				});
			}
		},
		controller : function($scope){
			var self = this;
			this.stars = [];
			this.static = $scope.static ? true : false;
			this.addNewStar = function(starCtrl) {
				self.stars.push(starCtrl);
			};

			$scope.$watch(function(){
				return $scope.ngModel
			}, function(newValue, oldValue) {
				if(newValue !== oldValue) {
					this.initNgModel();
				}
			}.bind(this));

			this.setHoverPercentage = function(percentage) {
				$(self.foregroundElement).css({'width' : percentage + '%'});
				var wholeStars = parseInt((percentage / 10 / 2) + .5);
				var stars = ((percentage / 10 / 2));
				$scope.ngModel = stars;
				if($scope.onHoverChanged) {
					$scope.onHoverChanged({$percentage : percentage, $starsWhole : wholeStars, $stars : stars});
				}
			};
			this.initNgModel = function() {
				if($scope.ngModel > 0) {
					self.setHoverPercentage($scope.ngModel * 20);
				}
			};
		},
		templateUrl : 'components/ag-rating-stars/ag-rating-stars.partial.html'
	}
});

myApp.directive('agRatingStarForeground', function() {
	return {
		restrict : 'AE',
		require : '^agRatingStars'
	}
});
myApp.directive('agRatingStarsForeground', function() {
	return {
		restrict : 'AE',
		require : '^agRatingStars',
		link : function(scope, element, attrs, ctrl) {
			ctrl.foregroundElement = element;
			ctrl.initNgModel();
		}
	}
});
myApp.directive('agRatingStarBackground', function() {
	return {
		restrict : 'AE',
		require : '^agRatingStars',
		link : function(scope, element, attrs, ctrl) {
		},
		controller : function($element) {
			var agRatingStarsController = $element.controller('agRatingStars');
			this.index = agRatingStarsController.stars.length;
			var index = this.index;

			agRatingStarsController.addNewStar(this);
			this.halves = {
				right: undefined,
				left: undefined
			};
			function getHoverPercentage(isHalf) {
				var totalStars = agRatingStarsController.stars.length;
				var currentStar = !isHalf ? index + 1 : index + 1 - (1/2);
				return currentStar / totalStars * 100;
			}
			this.processHoverLeft = function(star) {
				agRatingStarsController.setHoverPercentage(getHoverPercentage(true));
			};
			this.processHoverRight = function(star) {
				agRatingStarsController.setHoverPercentage(getHoverPercentage(false));
			};
		}
	}
});

myApp.directive('agRatingStarHalfLeft', function() {
	return {
		restrict : 'AE',
		require : ['^agRatingStarBackground', '^^agRatingStars'],
		link : function(scope, element, attrs, ctrls) {
			var ctrl = ctrls[0],
				agRatingStarsCtrl = ctrls[1];
			if(agRatingStarsCtrl.static) {return;}
			ctrl.halves.left = element;
			element.on('mouseenter', function () {
				ctrl.processHoverLeft();
			});
		}
	}
});

myApp.directive('agRatingStarHalfRight', function() {
	return {
		restrict : 'AE',
		require : ['^agRatingStarBackground', '^^agRatingStars'],
		link : function(scope, element, attrs, ctrls) {
			var ctrl = ctrls[0],
				agRatingStarsCtrl = ctrls[1];
			if(agRatingStarsCtrl.static) {return;}
			ctrl.halves.right = element;
			element.on('mouseenter', function () {
				ctrl.processHoverRight();
			});
		}
	}
});
myApp.directive("editButton", function(){
	return {
		restrict : 'AE',
		template : '\
			<div ng-if="isMe()" class="edit-button">\
			<div class="edit">\
			<i ng-if="!editing" class="fa fa-edit"></i>\
			<i ng-if="editing" class="fa fa-times"></i>\
			</div>\
			</div>\
		',
		controller : 'EditButtonController',
		link : function(scope, element, attrs) {
		}
	}
});
myApp.controller('EditButtonController', function($scope, TrainerFactory, Auth) {
	Auth.isLoggedInAsync(function(){
		var user = Auth.getCurrentUser();
		$scope.isMe = function(){
			return user
			&& TrainerFactory.trainer
			&& user._id == TrainerFactory.trainer._id;
		}
	})
})
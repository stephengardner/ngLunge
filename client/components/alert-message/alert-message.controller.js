lungeApp.controller("AlertMessageController", function($scope, AlertMessage) {
	$scope.getMessage = function(){
		return AlertMessage.message;
	};
	$scope.getType = function(){
		return AlertMessage.type;
	};
	$scope.isActive = function() {
		return AlertMessage.active;
	}
});
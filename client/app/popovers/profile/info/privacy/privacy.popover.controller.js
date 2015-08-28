myApp.controller("PrivacyPopoverController", function($rootScope, $scope){
	$scope.changePrivacyTo = function(value){
		$rootScope.$broadcast("privacy-change", value);
	}
})
myApp.controller('agProfileShareButtonController', function($mdBottomSheet, $scope){
	$scope.showBottomSheet = function() {
		$mdBottomSheet.show({
			templateUrl: 'components/ag-profile-share-button' +
			'/bottom-sheet' +
			'/ag-profile-share-button-bottom-sheet.partial.html',
			parent : '#main-view',
			clickOutsideToClose: true
		})
	}
})
myApp.controller('AgProfileShareButtonBottomSheetController', function(Socialshare,
                                                                       $mdBottomSheet,
                                                                       $location,
                                                                       TrainerFactory,
                                                                       TrainerMeta,
                                                                       Auth,
                                                                       $scope){
	$scope.items = [
		{ name : 'Facebook', icon : 'facebook' },
		{ name: 'Twitter', icon: 'twitter' },
		{ name: 'LinkedIn', icon: 'linkedin' }
		// { name: 'Copy', icon: 'copy' },
		// { name: 'Print this page', icon: 'print' },
	];

	$scope.trainerUrl = $location.protocol() + "://" + location.host;
	if(Auth.getCurrentType() == 'trainee') {
		$scope.trainerUrl += '/user/'
	}
	else {
		$scope.trainerUrl += '/';
	}
	$scope.trainerUrl += Auth.getCurrentUser().urlName;

	$scope.listItemClick = function(item) {
		Socialshare.share({
			provider : item.icon,
			'attrs': TrainerMeta.createSocialshareAttributes(item.icon)
		});
	};
})
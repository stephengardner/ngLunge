myApp.controller('AgProfileShareButtonBottomSheetController', function(Socialshare,
                                                                       $mdBottomSheet,
                                                                       $location,
                                                                       TrainerFactory,
                                                                       Auth,
                                                                       UserMeta,
                                                                       $mdToast,
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

	$scope.afterCopiedUrl = function(){
		var element = angular.element('#share-bottom-sheet md-list');
		$scope.toast = $mdToast.show({
			parent : element,
			position: 'bottom left',
			template : '<md-toast>\
				<span flex layout="row" layout-align="start center">\
					<i class="material-icons" style="margin-right: 10px">check</i> \
					Copied to clipboard!\
				</span>\
			</md-toast>'
		});
	};

	$scope.listItemClick = function(item) {
		Socialshare.share({
			provider : item.icon,
			'attrs': new UserMeta(Auth.getCurrentUserFactory()).createSocialShareAttributes(item.icon)
		});
	};
});
myApp.directive('agTrainerMasthead', function(AlertMessage,
                                              TrainerFactory,
                                              LoginDialog,
                                              UserFactory){
	return {
		restrict : 'AE',
		scope : {
			userFactory : '='
		},
		link : function(scope, element, attrs){

		},
		templateUrl : 'components/ag-trainer-masthead/ag-trainer-masthead.partial.html',
		controller : ['$mdMedia', '$mdToast', '$scope', 'Auth', '$mdDialog',
			function($mdMedia, $mdToast, $scope, Auth, $mdDialog){
			var userFactory = $scope.userFactory;
			$scope.openMenu = function($mdOpenMenu, ev) {
				originatorEv = ev;
				$mdOpenMenu(ev);
			};

			$scope.reviewDialog = function(ev) {
				if(Auth.getCurrentUser()._id == userFactory.user._id) {
					// return $mdToast.show({
					// 	position : 'top right',
					// 	parent : '.main-view',
					// 	template : '<md-toast> ' +
					// 	'You can\'t review yourself' +
					// 	'</md-toast>'
					// });
				}
				LoginDialog.test({ ev : ev }).then(function(response) {
					$mdDialog.show({
						focusOnOpen: false,
						clickOutsideToClose: true,
						scope : $scope,
						preserveScope : true,
						targetEvent: ev || originatorEv,
						controller: 'TrainerReviewController',
						controllerAs : 'vm',
						templateUrl: 'components/trainer-review/trainer-review-dialog.partial.html'
					});
				});
			};

			$scope.loggedInUserHasFavoriteTrainer = function(){
				return Auth.isLoggedIn() &&
					Auth.getCurrentUserFactory()
						.hasFavoritedUser(userFactory.user._id);
			};

			$scope.loggedInUserHasReviewedTrainer = function() {
				return Auth.isLoggedIn() &&
					Auth.getCurrentUserFactory()
						.hasReviewedUser(userFactory.user._id);
			};
			function getFavoriteToastMessage() {
				return !$scope.loggedInUserHasFavoriteTrainer()
					? 'Removed ' + userFactory.user.name.first + ' from your favorites!'
					: 'Added ' + userFactory.user.name.first + ' to your favorites';
			}

			$scope.toggleFavorites = function(ev) {
				if(Auth.getCurrentUser()._id == userFactory.user._id) {
					return $mdToast.show({
						position : 'top right',
						parent : '.main-view',
						template : '<md-toast> ' +
						'You can\'t favorite yourself, unfortunately ' +
						'<i style="margin-left: 5px;" class="em em-wink">' +
						'</i>' +
						'</md-toast>'
					});
				}
				$scope.favoriteBusy = true;
				LoginDialog.test({ ev : ev }).then(function(response) {
					Auth.getCurrentUserFactory()
						.toggleFavoriteTrainer(userFactory.user._id)
						.then(function(response){
							$scope.favoriteBusy = false;
							$mdToast.show($mdToast.simple().position('top right').parent('.main-view')
								.textContent(getFavoriteToastMessage()));
						}).catch(function(err){
						$scope.favoriteBusy = false;
						AlertMessage.error('Something went wrong, please try again');
					})
				}).catch(function(err){
					// Not logged in!
				})
			}

		}]
	}
});
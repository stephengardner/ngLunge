myApp.directive('trainerCertificationStatusCountBubbles', ['$mdDialog', function($mdDialog){
	return {
		restrict : 'AE',
		replace : true,
		scope : {
			trainer : '=',
			certificationOrganization : '=',
			showTotal : '='
		},
		templateUrl : 'components/trainer-certification-status-count-bubbles/trainer-certification-status-count-bubbles.partial.html',
		link : function(scope, elem, attrs){
			scope.openDialog = function(certificationOrganization, ev) {
				$mdDialog.show({
					templateUrl : 'components/trainer-certification-status-count-bubbles/dialog/trainer-certification-status-count-bubbles-dialog.partial.html',
					targetEvent : ev,
					clickOutsideToClose : true,
					controller : [function(){
						var vm = this;
						vm.certificationOrganization = certificationOrganization;
						vm.countAdded = scope.countAdded;
						vm.countPending = scope.countPending;
						vm.countVerified = scope.countVerified;
						vm.countUnverified = scope.countUnverified;
						vm.countRejected = scope.countRejected;
						vm.cancel = $mdDialog.hide;
						vm.trainer = scope.trainer;
					}],
					controllerAs : 'vm'
				})
			};
			console.log(scope.trainer.certifications_meta.organization_map);
			function getCount(type) {
				if(scope.trainer.certifications_meta.organization_map[scope.certificationOrganization._id])
					return scope.trainer.certifications_meta.organization_map[scope.certificationOrganization._id]
						.types[type];
				return 0;
			}
			scope.setCounts = function() {
				scope.countAdded = getCount('count_all');
				scope.countPending = getCount('count_pending');
				scope.countVerified = getCount('count_verified');
				scope.countUnverified = getCount('count_unverified');
				scope.countRejected= getCount('count_rejected');
			};
			scope.setCounts();
			scope.$watch(function(){
				return scope.certificationOrganization
			}, function(newValue, oldValue) {
				scope.setCounts();
			});
			scope.$watch(function(){
				return scope.trainer
			}, function(newValue, oldValue) {
				scope.setCounts();
			}, true)
		}
	}
}]);
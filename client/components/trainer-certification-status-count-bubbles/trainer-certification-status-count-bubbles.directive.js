myApp.directive('trainerCertificationStatusCountBubbles', ['lodash', '$mdDialog', function(lodash, $mdDialog){
	return {
		restrict : 'AE',
		replace : true,
		scope : {
			trainer : '<',
			certificationOrganization : '<',
			showTotal : '<'
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
				});
			};

			scope.setCounts = function() {
				if(!scope.trainer || !scope.trainer.certifications_meta) return;
				scope.countAdded = getCount('count_all');
				scope.countPending = getCount('count_pending');
				scope.countVerified = getCount('count_verified');
				scope.countUnverified = getCount('count_unverified');
				scope.countRejected= getCount('count_rejected');
			};

			if(scope.trainer)
				scope.setCounts();

			// attempting another very shallow watch here... Getting the specific object in question
			scope.$watch(function(){
				if(scope.trainer
					&& scope.trainer.certifications_meta
					&& scope.trainer.certifications_meta.organization_map
					&& scope.trainer.certifications_meta.organization_map[scope.certificationOrganization._id]
					&& scope.trainer.certifications_meta.organization_map[scope.certificationOrganization._id].types
				)
				return scope.trainer.certifications_meta.organization_map[scope.certificationOrganization._id].types;
			}, function(newValue, oldValue) {
				if(newValue && !isEqualCounts(newValue, oldValue)) {
					console.log("[Trainer Certification Status Count Bubbles] watch triggered.  New value did not" +
						" equal Old Value.  They are: new: ", newValue, " old: ", oldValue);
					scope.setCounts();
				}
			});

			function getCount(type) {
				if(scope.trainer.certifications_meta.organization_map &&
					scope.trainer.certifications_meta.organization_map[scope.certificationOrganization._id])
					return scope.trainer.certifications_meta.organization_map[scope.certificationOrganization._id]
						.types[type];
				return 0;
			}
			function isEqualCounts(a, b) {
				return a && b &&
					a.count_all == b.count_all &&
					a.count_pending == b.count_pending &&
					a.count_verified == b.count_verified &&
					a.count_unverified == b.count_unverified &&
					a.count_rejected == b.count_rejected
					;
			}
		}
	}
}]);
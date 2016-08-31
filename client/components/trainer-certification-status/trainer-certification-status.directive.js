myApp.directive('trainerCertificationStatus', ['$mdDialog', function($mdDialog){
	return {
		restrict : 'AE',
		replace : true,
		scope : {
			trainer : '<',
			certification : '<'
		},
		templateUrl : 'components/trainer-certification-status/trainer-certification-status.partial.html',
		link : function($scope, $elem, $attrs) {
			// On the trainer account page, this is being re-linked.
			// I suppose this is happening because the resource is updating and creating entirely new directives,
			// but i could be wrong.
			// Essentially, what this means is the $scope.$watch isn't effective for that route.
			// But may be effective for others.  In fact I believe it is, for the general list page.
			
			/// get the status of a certification if the trainer has it in its certification_v2 array
			$scope.openDialog = function(status, ev) {
				$mdDialog.show({
					templateUrl : 'components/trainer-certification-status/dialog/' +
					'trainer-certification-status-dialog.partial.html',
					targetEvent : ev,
					controller : [function(){
						var vm = this;
						vm.status = status;
						vm.cancel = $mdDialog.cancel;
					}],
					controllerAs : 'vm'
				});
			};
			$scope.getStatus = function() {
				var trainer = $scope.trainer,
					certification = $scope.certification
					;
				if(!trainer.certifications_v2) return false;
				var inputCertificationID = certification._id ? certification._id : certification,
					foundCertification
					;
				for(var i = 0; i < trainer.certifications_v2.length; i++) {
					var certificationV2 = trainer.certifications_v2[i];
					if(certificationV2.active === false) continue;
					var certification_type = certificationV2.certification_type;
					if(inputCertificationID == certification_type._id) {
						foundCertification = certificationV2;
					}
				}
				if(!foundCertification) return false;
				return foundCertification.verification.status;
			};
			$scope.setStatus = function() {
				$scope.status = $scope.getStatus();
			};
			$scope.setStatus();

			// watch on busy because this is a VERY SHALLOW WATCH
			// don't watch on the whole trainer object, or something dumb like that
			$scope.$watch(function(){
				return $scope.certification.busy
			}, function(newValue, oldValue) {
				if(newValue != oldValue){
					console.log("trainer-certification-status watch triggered");
					$scope.setStatus();
				}
			})
		}
	}
}])
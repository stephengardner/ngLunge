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
			}
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
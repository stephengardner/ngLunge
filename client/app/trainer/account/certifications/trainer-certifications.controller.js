
lungeApp.controller("TrainerCertificationsController",
	function(TrainerCertifications, FullMetalSocket, CertificationOrganization, TrainerFactory, AlertMessage, Auth,
	         Certification, $http, $scope, ngDialog){

		$scope.verifyCertificationPopup = function(certificationV2) {
			$scope.certificationV2 = certificationV2;
			$scope.modal = ngDialog.open({
				template: "app/trainer/account/certifications/verify-modal/trainer-account-certifications-verify-modal.template.html",
				scope: $scope,
				className: 'ngdialog-theme-default large',
				controller: "TrainerAccountVerifyCertificationsModalController"
			});
		};

		$scope.getTrainerModelCertificationType = function(certificationType) {
			for(var i = 0; i < TrainerFactory.trainer.certifications_v2.length; i++) {
				var certification_v2 = TrainerFactory.trainer.certifications_v2[i];
				if(certification_v2.certification_type._id == certificationType._id) {
					return certification_v2;
				}
			}
		}

		$scope.certificationsEmpty = function() {
			if($scope.trainerFactory) {
				var arr = $scope.trainerFactory.trainer.certifications_v2.filter(function(item){
					if(item.active == false){
						return false;
					}
					return true;
				})
				return arr.length == 0 ? true : false;
			}
			else {
				return false;
			}
		}

		$scope.deleteCertification = function(certification){
			certification.removing = true;
			var messageToSend = "Removed a " + certification.certification_type.name + " certification from your profile";
			TrainerFactory.removeCertification(certification.certification_type).save().then(onSuccess).catch(onError);
			function onSuccess() {
				certification.removing = false;
				AlertMessage.success(messageToSend);
				certification.busy = false;
				certification.removing = false;
			}
			function onError(err){
				certification.removing = false;
				certification.busy = false;
			}
		}
		$scope.toggleDeleteCertification = function(certificationV2) {
			certificationV2.removalConfirmation = !certificationV2.removalConfirmation;
		}

	});
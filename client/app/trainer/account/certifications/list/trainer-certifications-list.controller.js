// I fixed this controller, separated it into a TrainerCertifications Service on 1.26.16
// It is actually quite lean now, lookups operate on hash tables (objects).  Using ng-infinite-scroll as well.
lungeApp.controller("TrainerCertificationsListController", function(ngDialog, TrainerCertifications, FullMetalSocket, CertificationOrganization, TrainerFactory, AlertMessage, Auth, Certification, $http, $scope, $mdDialog){
	$scope.trainerCertifications = TrainerCertifications;
	$scope.ajax = TrainerCertifications.ajax;
	$scope.trainerFactory = TrainerFactory;
	
	$scope.openMenu = function($mdOpenMenu, ev) {
		originatorEv = ev;
		$mdOpenMenu(ev);
	};
	
	$scope.certificationTypeInfoModal = function(certificationType, ev) {
		console.log("CERT:", certificationType);
		$mdDialog.show({
			controller : ['$scope', function($scope){
				console.log("OK:", certificationType);
				$scope.certificationType = certificationType;
				$scope.cancel = $mdDialog.cancel;
			}],
			templateUrl : "app/certifications/certification-type/modal-info/certification-type-modal-info.modal.html",
			targetEvent : ev,
			clickOutsideToClose : true
		})
	};
	//
	// 	function(certificationType) {
	// 	$scope.certificationType = certificationType;
	// 	$scope.modal = ngDialog.open({
	// 		template: "app/certifications/certification-type/modal-info/certification-type-modal-info.modal.html",
	// 		scope: $scope,
	// 		className: 'ngdialog-theme-default large',
	// 		controller: "CertificationTypeModalInfoController"
	// 	});
	// };

	$scope.trainerCertifications.getPage();

	// This is set as a virtual on the trainer if the trainer is populated, which it is.
	$scope.getCertificationOrganizationCount = function(certificationOrganization){
		if(TrainerFactory.trainer.certifications_v2_map
			&& TrainerFactory.trainer.certifications_v2_map[certificationOrganization._id]) {
			return TrainerFactory.trainer.certifications_v2_map[certificationOrganization._id].count;
		}
		return undefined;
	}

	// If we need to re-get the same page.
	$scope.refreshCertifications = function() {
		TrainerCertifications.refresh();
	};

	$scope.addOrRemoveCertification = function(type, certification) {
		var messageToSend;
		certification.busy = true;
		$scope.ajax.busy = true;
		if(type == 'add') {
			messageToSend = "Added a " + certification.name + " certification to your profile";
			TrainerFactory.addCertification(certification).save().then(onSuccess).catch(onError);
		}
		else if(type == 'remove') {
			messageToSend = "Removed a " + certification.name + " certification from your profile";
			TrainerFactory.removeCertification(certification).save().then(onSuccess).catch(onError);
		}
		else { alert('invalid type'); return; }
		function onSuccess() {
			AlertMessage.success(messageToSend);
			certification.busy = false;
			$scope.ajax.busy = false;
		}
		function onError(err){
			certification.busy = false;
			$scope.ajax.busy = false;
		}
	};

	// scope check if a trainer can Add or Remove a given cert
	$scope.trainerHasCertification = function(certification) {
		return TrainerCertifications.trainerHasCertification(TrainerFactory.trainer, certification);
	};


	FullMetalSocket.certification.syncUnauth(function(event, msg){
		$scope.refreshCertifications();
		AlertMessage.info("Notice: Lunge certifications have recently been updated");
	}.bind(this));

	$scope.$on('$destroy', function(){
		FullMetalSocket.certification.unsyncUnauth();
	});
});
// I fixed this controller, separated it into a TrainerCertifications Service on 1.26.16
// It is actually quite lean now, lookups operate on hash tables (objects).  Using ng-infinite-scroll as well.
lungeApp.controller("ListCertificationsController", function($document,
                                                                    TrainerCertifications,
                                                                    $timeout,
                                                                    FullMetalSocket,
                                                                    CertificationOrganization,
                                                                    TrainerFactory,
                                                                    AlertMessage,
                                                                    Auth,
                                                                    Certification,
                                                                    $http,
                                                                    $scope,
                                                                    $mdDialog){
	var originatorEv;
	$scope.trainerCertifications = TrainerCertifications;
	TrainerFactory.initToCurrentTrainerIfNecessary();

	$scope.ajax = TrainerCertifications.ajax;

	$scope.trainerFactory = TrainerFactory;

	$scope.openMenu = function($mdOpenMenu, ev) {
		originatorEv = ev;
		$mdOpenMenu(ev);
	};
	
	$scope.certificationTypeInfoModal = function(certificationType) {
		$mdDialog.show({
			controller : ['$scope', function($scope){
				$scope.certificationType = certificationType;
				$scope.cancel = $mdDialog.cancel;
			}],
			templateUrl : "app/certifications/certification-type/modal-info/certification-type-modal-info.modal.html",
			targetEvent : originatorEv,
			clickOutsideToClose : true
		})
	};

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
		// We pause 200 ms to keep from being very choppy with the menu button
		if(type == 'add') {
			messageToSend = "Added a " + certification.name + " certification to your profile";
			console.log("Adding certification:", certification, " from trainercertificationslistcontroller");
			$timeout(function(){
				TrainerFactory.addCertification(certification).save().then(onSuccess).catch(onError);
			}, 500);
		}
		else if(type == 'remove') {
			messageToSend = "Removed a " + certification.name + " certification from your profile";
			$timeout(function(){
				TrainerFactory.removeCertification(certification).save().then(onSuccess).catch(onError);
			}, 500);
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
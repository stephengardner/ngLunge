// I fixed this controller, separated it into a TrainerCertifications Service on 1.26.16
// It is actually quite lean now, lookups operate on hash tables (objects).  Using ng-infinite-scroll as well.
lungeApp.controller("TrainerCertificationsListController", function(ngDialog, TrainerCertifications, FullMetalSocket, CertificationOrganization, TrainerFactory, AlertMessage,
                                                         /*socket,*/ Auth, Certification, $http, $scope, $timeout){
	$scope.ajax = TrainerCertifications.ajax;
	$scope.certificationOrganizations = [];
	$scope.query = '';

	// TrainerFactory is already set for all account routes
	TrainerFactory.setSyncCallback(function(){
	});

	$scope.certificationTypeInfoModal = function(certificationType) {
		$scope.certificationType = certificationType;
		$scope.modal = ngDialog.open({
			template: "app/certifications/certification-type/modal-info/certification-type-modal-info.modal.html",
			scope: $scope,
			className: 'ngdialog-theme-default large',
			controller: "CertificationTypeModalInfoController"
		});
	}

	// This is set as a virtual on the trainer if the trainer is populated, which it is.
	$scope.getCertificationOrganizationCount = function(certificationOrganization){
		if(TrainerFactory.trainer.certifications_v2_map
			&& TrainerFactory.trainer.certifications_v2_map[certificationOrganization._id]) {
			return TrainerFactory.trainer.certifications_v2_map[certificationOrganization._id].count;
		}
		return undefined;
	}

	// after getting the certifications, apply these results.  The certifications are stored in the
	// "TrainerCertifications" service.  A small service to get/set certs.
	function apply() {
		console.log("Gotem...");
		$scope.certificationOrganizations = TrainerCertifications.certificationOrganizations;
		$scope.ajax = TrainerCertifications.ajax;
	}

	$scope.reset = function() {
		$scope.certificationOrganizations = [];
		TrainerCertifications.reset();
	}

	// Get the next page, then apply.
	$scope.getCertifications = function(){
		console.log("Getting");
		TrainerCertifications.setQuery($scope.query);
		TrainerCertifications.getPage().then(apply).catch(function(err){
			console.log(err);
		});
	};
	// If we need to re-get the same page.
	$scope.refreshCertifications = function() {
		TrainerCertifications.setQuery($scope.query);
		TrainerCertifications.refresh().then(apply).catch(function(err){
			console.log(err);
		});
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
		return TrainerCertifications.trainerHasCertificaiton(TrainerFactory.trainer, certification);
	};

	$scope.clear = function() {
		$scope.reset();
		$scope.query = '';
		TrainerCertifications.setQuery('');
		$scope.getCertifications();
	}
	$scope.queryCertifications = function() {
		$scope.reset();
		TrainerCertifications.setQuery($scope.query);
		$scope.getCertifications();
	};

	$scope.getCertifications();

	FullMetalSocket.certification.syncUnauth(function(event, msg){
		$scope.refreshCertifications();
		AlertMessage.info("Notice: Lunge certifications have recently been updated");
	}.bind(this));

	$scope.$on('$destroy', function(){
		FullMetalSocket.certification.unsyncUnauth();
	});
});
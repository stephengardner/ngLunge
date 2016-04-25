
lungeApp.controller("AdminCertificationsListController", function(FormControl, CertificationType, $timeout,
                                                                  CertificationOrganization, ngDialog,
                                                                  AlertMessage, $http, $scope){
	// Creating a new certification Organization
	$scope.newCertificationOrganization = {
		editing : false
	};
	$scope.ajax = { busy : false };
	$scope.errors = FormControl.errors;
	$scope.newCertification = {};
	$scope.certificationOrganizations = [];
	$scope.selectedCertificationOrganization = {};
	$scope.toggleNewCertificationOrganization = function() {
		$scope.newCertificationOrganization.editing = !$scope.newCertificationOrganization.editing;
	};
	$scope.removeMongooseError = FormControl.removeMongooseError;

	function preserveOpenAccordions(newResource) {
		var isOpenMap = {}
		for(var i = 0; i < $scope.certificationOrganizations.length; i++) {
			if($scope.certificationOrganizations[i].isOpen) {
				isOpenMap[$scope.certificationOrganizations[i]._id] = true;
			}
		}
		for(var i = 0; i < newResource.length; i++) {
			if(isOpenMap[newResource[i]._id]) {
				newResource[i].isOpen = true;
			}
		}
		return newResource;
	}
	$scope.queryCertificationOrganizations = function(){
		CertificationOrganization.query(function(response){
			$scope.certificationOrganizations = preserveOpenAccordions(response);
		});
	};

	$scope.submitNewCertificationOrganization = function(form){
		$scope.ajax.busy = true;
		CertificationOrganization.save($scope.newCertificationOrganization, function(response){
			AlertMessage.success("Added the " + $scope.newCertificationOrganization.name + " organization");
			$scope.queryCertificationOrganizations();
			$scope.ajax.busy = false;
			$scope.newCertificationOrganization.editing = false;
		}, function(err){
			FormControl.parseValidationErrors(form, err);
			$scope.errors = FormControl.errors;
			$scope.ajax.busy = false;
			console.log("submitNewCertificationOrganization error:", err);
		});
	};


	/*
	$scope.toggleOpen = function(certificationOrganization) {
		if(certificationOrganization.open === true) {
			console.log("...", certificationOrganization);
			certificationOrganization.open = false;
		}
		else{
			console.log("---");
			certificationOrganization.open = true;
		}
	}
	*/

	// Deleting a certification Organization
	$scope.delete = function(certificationOrganizations){
		$http({
			method : 'DELETE',
			url : 'api/certification-organizations/' + certificationOrganizations._id
		}).success(function(response){
			$scope.certificationOrganizations.splice($scope.certificationOrganizations.indexOf(certificationOrganizations), 1);
			AlertMessage.success(certificationOrganizations.name + " removed!");
			$scope.queryCertificationOrganizations();
		}).error(function(err){
			console.log("Error on removing a cert:", err);
		})
	};

	$scope.newCertificationForm = function(issuingOrganization) {
		$scope.selectedCertificationOrganization = issuingOrganization;
		$scope.newCertification = {
			organization : issuingOrganization._id
		}
		$scope.modal = ngDialog.open({
			template: "app/modals/admin/certifications/admin-certification-add-modal.template.html",
			scope: $scope,
			controller: "AdminCertificationAddModalController"
		});
	};

	$scope.isCertificationOrganizationOpen = function(certificationOrganization) {
		return certificationOrganization._id == $scope.selectedCertificationOrganization._id;
	}
	$scope.submitNewCertiification = function() {
		console.log("THE NEW CERTIFICATION ISSSSSSSSSSSS:", $scope.newCertification);
		CertificationType.save($scope.newCertification, function(response){
			$scope.queryCertificationOrganizations();
		}, function(err){
			console.log("submitNewCertification Error:", err);
		})
		$scope.modal.close();
	}

	$scope.deleteCertificationType = function(certificationType) {
		CertificationType.delete({id : certificationType._id}, function(){
			$scope.queryCertificationOrganizations();
		})
	}
	$scope.queryCertificationOrganizations();

	CertificationType.query(function(response){
		console.log("All CertificationType:", response);
	})
});
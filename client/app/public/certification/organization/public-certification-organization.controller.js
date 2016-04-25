myApp.controller("PublicCertificationOrganizationController", function(CertificationOrganization, $stateParams, $scope){
	console.log("The certification is:", $stateParams.slug);
	CertificationOrganization.getBySlug({slug : $stateParams.slug}, function(response){
		console.log("RESPONSE:", response);
		$scope.certificationOrganization = response;
	})
	
})
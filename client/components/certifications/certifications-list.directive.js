lungeApp.directive("certificationsList", function(){
	return {
		restrict : "AE",
		templateUrl : 'components/certifications/certifications-list.partial.html',
		scope : {},
		controller : 'CertificationsListController'
	}
})
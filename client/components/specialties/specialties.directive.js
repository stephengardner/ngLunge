myApp.directive("specialties", function(){
	return {
		restrict : 'EA',
		controller : 'SpecialtiesController',
		controllerAs : 'SpecialtiesCtrl',
		templateUrl : 'components/specialties/specialty-list.partial.html'
	}
});
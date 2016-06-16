myApp.directive("specialties", function(){
	return {
		restrict : 'EA',
		controller : 'SpecialtiesController',
		scope : {
			editable : '@'
		},
		templateUrl : 'components/specialties/specialty-list.partial.html',
		link : function($scope, element, attrs) {
			if(attrs.editable) {
				$scope.editable = true;
			}
		}
	}
})
myApp.directive('rates', function(){
	return {
		restrict : 'AE',
		controller : 'RatesController',
		scope : {},
		templateUrl : 'components/rates/rates.partial.html',
		translcude : true,
		replace : true,
		link : function(scope, element, attrs){

		}
	}
})
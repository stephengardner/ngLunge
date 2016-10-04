angular.module('myApp').directive('rates', function(){
	return {
		restrict : 'AE',
		controller : 'RatesController',
		controllerAs : 'RatesCtrl',
		// bindToController : true,
		templateUrl : 'components/rates/rates.partial.html'
	}
})
myApp.directive('navbar', function(){
	return {
		restrict : 'AE',
		replace : true,
		controller : 'NavbarNewController',
		templateUrl : 'components/navbar-new/navbar-new.html'
	}
});

lungeApp.directive("alertConvenientUrl", function(){
	return {
		restrict : "AE",
		transclude : true,
		replace: true,
		controller : "ConvenientUrlController",
		templateUrl: "app/trainer/public/profile/components/profile-alerts/alert-convenient-url.partial.html"
	};
});
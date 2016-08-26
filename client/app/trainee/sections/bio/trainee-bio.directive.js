lungeApp.directive("traineeBio", function(){
	return {
		restrict : "AE",
		scope : {
			userFactory : '='
		},
		controller : "TraineeBioController",
		templateUrl : "app/trainee/sections/bio/trainee-bio.partial.html"
	}
});
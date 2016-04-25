myApp.directive("trainerSyncedProviders", function(){
	return {
		restrict : "AE",
		templateUrl : "app/trainer/public/profile/components/trainer-basic-info/components/trainer-synced-providers/trainer-synced-providers.html",
		transclude : true,
		replace : true
	}
})
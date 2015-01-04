lungeApp.directive("trainerSyncedProvider", function(){
	return {
		restrict : "AE",
		transclude : true,
		scope : true,
		controller : 'TrainerSyncedProviderController',
		templateUrl : "app/trainer/public/profile/components/trainer-basic-info/components/trainer-synced-provider/trainer-synced-provider.partial.html",
		link : function(scope, elem, attr) {
			if(attr.provider == "google") {
				scope.providerClass = "google-plus";
				scope.provider = "google";
			}
			else {
				scope.provider = scope.providerClass = attr.provider;
			}
		}
	}
});
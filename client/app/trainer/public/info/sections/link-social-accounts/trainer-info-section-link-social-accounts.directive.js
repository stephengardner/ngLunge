lungeApp.directive("trainerInfoSectionLinkSocialAccounts", function(){
	return {
		restrict : "AE",
		templateUrl : 'app/trainer/public/info/sections/' +
		'link-social-accounts/' +
		'trainer-info-section-link-social-accounts.partial.html',
		scope : {},
		controller : 'TrainerInfoSectionLinkSocialAccountsController'
	}
})
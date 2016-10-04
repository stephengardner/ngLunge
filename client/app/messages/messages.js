
angular.module('myApp')
	.config(function ($stateProvider) {
		$stateProvider
			.state('main.messages', {
				url: '/messages',
				abstract: true
			})
			.state('main.messages.message', {
				url: '/:id',
				authenticate: true,
				footer : false,
				views : {
					'@main' : {
						controller : "MessageController",
						controllerAs : 'vm',
						templateUrl : "app/messages/message/message.partial.html"
					}
				}
			});
	});
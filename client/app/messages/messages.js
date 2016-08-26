
angular.module('ngLungeFullStack2App')
	.config(function ($stateProvider) {
		$stateProvider
			.state('main.messages', {
				url: '/messages',
				abstract: true
			})
			.state('main.messages.message', {
				url: '/:id',
				views : {
					'@main' : {
						controller : "MessageController",
						templateUrl : "app/messages/message/message.partial.html"
					}
				}
			});
	});
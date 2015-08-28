myApp.factory('broadcastService', function($rootScope) {
	return {
		send: function(msg, data) {
			$rootScope.$broadcast(msg, data);
		}
	}
});
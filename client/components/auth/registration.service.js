lungeApp.factory('Registration', function ($resource) {
	return $resource('/api/registrations/:id/:controller', {
			id: '@_id'
		},
		{
			submitPassword : {
				method : 'PUT',
				params : {
					controller : 'submit_password'
				}
			},
			validateEmail : {
				method : 'POST',
				params : {
					controller : 'send_email'
				}
			},
			changePassword: {
				method: 'PUT',
				params: {
					controller:'password'
				}
			},
			get: {
				method: 'GET',
				params: {
					id:'me'
				}
			}
		});
});
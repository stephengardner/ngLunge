lungeApp.factory('CertificationOrganization', function ($resource) {
	return $resource('/api/certification-organizations/:id/:controller', {
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
			getBySlug : {
				method : 'GET',
				params : {
					controller : 'bySlug'
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
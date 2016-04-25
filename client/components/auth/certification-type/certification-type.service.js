lungeApp.factory('CertificationType', function ($resource) {
	return $resource('/api/certification-types/:id/:controller', {
			id: '@_id'
		},
		{
			get: {
				method: 'GET',
				params: {
					id:'me'
				}
			}
		});
});
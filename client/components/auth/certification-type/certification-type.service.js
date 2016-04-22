lungeApp.factory('Certification', function ($resource) {
	return $resource('/api/certifications/:id/:controller', {
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
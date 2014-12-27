
angular.module('ngLungeFullStack2App')
	.factory('Certification', function ($resource) {
		return $resource('/api/certifications/:id/:controller', {
				id: '@_id'
			},
			{
				update : {
					method : 'PUT'
				},
				addType: {
					method: 'PUT',
					params: {
						controller:'addType'
					}
				},
				removeType: {
					method: 'POST',
					params: {
						controller:'removeType'
					}
				},
				get: {
					method: 'GET',
					params: {
						id:'me'
					}
				},
				changeProfilePicture : {
					method : 'PUT',
					params : {
						controller : 'profilePicture'
					}
				}
			});
	});

'use strict';

angular.module('ngLungeFullStack2App')
  .factory('User', function ($resource) {
    return $resource('/api/users/:id/:controller', {
      id: '@_id'
    },
    {
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

angular.module('ngLungeFullStack2App')
	.factory('Trainer', function ($resource) {
		return $resource('/api/trainers/:id/:controller', {
				id: '@_id'
			},
			{
				update : {
					method : 'PUT'
				},
				changePassword: {
					method: 'PUT',
					params: {
						controller:'password'
					}
				},
				/*
				addCertification : {
					method : 'PUT',
					params : {
						controller : 'certification'
					}
				},
				*/
				modifyCertification : {
					method : 'PUT',
					params : {
						controller : 'certification'
					}
				},
				/*
				removeCertification : {
					method : 'DELETE',
					params : {
						controller : 'certification'
					}
				},
				*/
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
				},
				changeEmail : {
					method : 'PUT',
					params : {
						controller : 'changeEmail'
					}
				},
				addLocation : {
					method : 'PUT',
					params : {
						controller : 'addLocation'
					}
				},
				removeLocation : {
					method : 'PUT',
					params : {
						controller : 'removeLocation'
					}
				},
				updateLocation : {
					method : 'PUT',
					params : {
						controller : 'updateLocation'
					}
				}
			});
	});

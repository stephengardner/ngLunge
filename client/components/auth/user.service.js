'use strict';

angular.module('myApp')
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
				markMessageRead : {
					method : 'POST',
					url : '/api/users/:id/messages/:messageId/read',
					params : {
						id : '@id',
						messageId : '@messageId'
					}
				},
				readChatNotifications : {
					method: 'GET',
					url : '/api/users/:id/chat/notifications/read',
					params: {
						id:'me'
					}
				},
				getChats : {
					method: 'GET',
					params: {
						controller : 'chat'
					},
					isArray : true
				},
				sendChat : {
					method : 'GET',
					url : '/api/users/:id/chat/send'
				},
				// getChat : {
				// 	method: 'GET',
				// 	url : '/api/chats/:id/chat/notifications/read',
				// 	params: {
				// 		controller : 'chat'
				// 	},
				// 	isArray : true
				// },
				get: {
					method: 'GET',
					params: {
						id:'me'
					}
				}
			});
	});

angular.module('myApp')
	.factory('Trainer', function ($resource) {
		return $resource('/api/trainers/:id/:controller/:object_id', {
				id: '@_id'
			},
			{
				update : {
					method : 'PUT'
				},
				updateOverwrite : {
					method : 'PUT',
					params : {
						controller : 'overwrite'
					}
				},
				changePassword : {
					method: 'PUT',
					params: {
						controller:'password'
					}
				},
				contactInquiries : {
					method : 'POST',
					params : {
						controller : 'contact-inquiries'
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
				deleteCertificationFile : {
					method : 'DELETE',
					params : {
						controller : 'certification-file',
						object_id : '@_object_id'
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

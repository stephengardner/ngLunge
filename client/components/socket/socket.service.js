/* global io */
'use strict';
angular.module('ngLungeFullStack2App')
	.factory('socket_v2', function($q, socketFactory, $rootScope) {
		var ioSocket;
		var socket;
		var authenticatePromise = function(){
			return new $q(function(resolve, reject) {
				if(Socket_v2.authenticated) {
					console.log("|socket_v2| authenticatePromise already authenticated");
					return resolve(true);
				}
				if(!Socket_v2.socket) {
					Socket_v2.init();
				}
				Socket_v2.socket.emit('custom-authenticate', { token : Socket_v2.token });
				Socket_v2.socket.on('user:authenticated', function(){
					console.log("Socket received event user:authenticated from authenticatePromise");
					Socket_v2.authenticated = true;
					return resolve(true);
				});
				Socket_v2.socket.on('unauth:connected', function(){
					console.log("Socket received event unauth:connected from authenticatePromise");
					Socket_v2.authenticated = false;
					return resolve(false);
				});
			});
		};
		var Socket_v2 = {
			ioSocket : false,
			token : false,
			authenticated : false,
			rooms : [],

			inRoom : function(roomName) {
				for(var i = 0; i < this.rooms.length; i++) {
					var roomAtIndex = this.rooms[i];
					if(roomAtIndex == roomName) {
						return true;
					}
				}
				return false;
			},

			joinRoom : function(room) {
				console.log("[Socket] join room: " + room);
				this.socket.emit("joinRoom", room);
				this.rooms.push(room);
			},

			leaveRoom : function(room) {
				console.log("[Socket] leave room: " + room);
				this.socket.emit("leaveRoom", room);
				for(var i = 0; i < this.rooms.length; i++) {
					var roomAtIndex = this.rooms[i];
					if(roomAtIndex == room) {
						this.rooms.splice(i, 1);
						return;
					}
				}
			},

			authenticate : authenticatePromise,

			// alias, so we know that something is authenticated
			checkAuthentication : function(){
				return this.authenticate();
			},

			reconnect : function() {
				var self = this;
				this.init(); // Not sure if this is necessary
				function joinAllRooms(){
					console.log("[Socket] joinAllRooms joining room list:", self.rooms);
					for(var i = 0; i < self.rooms.length; i++) {
						var room = self.rooms[i];
						self.socket.emit('joinRoom', room);
					}
				}
				this.authenticate().then(function(){
					joinAllRooms();
				});
			},

			// Initialize the socket, it can come with a blank query token (unauthed).
			init : function(token){
				console.log("[Socket] calling socket_v2.init()");
				this.token = token;
				if(this.socket) {
					socket.connect();
					this.socket = socket;
					this.socket.emit('custom-authenticate', { token : token });
					return;
				}
				this.token = token;
				ioSocket = io('', {
					// Send auth token on connection, you will need to DI the Auth service above
					//forceNew: true,
					query: 'token=' + token,
					path: '/socket.io-client',
					transports: ['websocket'] // ON PAAS (heroku) we cannot use Polling
				});
				socket = socketFactory({
					ioSocket: ioSocket
				});
				this.socket = socket;
				this.socket.emit('custom-authenticate', { token : token });

				// If init is called twice, make sure we remove that reconnect event
				this.socket.removeAllListeners('reconnect');
				this.socket.on('reconnect', function(){
					console.log("[Socket] reconnect event triggered");
					this.reconnect();
				}.bind(this))
			},

			reset : function() {
				Socket_v2.ioSocket = false;
				Socket_v2.token = false;
			},

			// Sync updates across the entire model, this can be useful for things that are rarely updated
			// Like certifications
			syncUpdates : function(modelName, cb) {
				console.log("socket.service: syncUpdates() binding to: " + modelName + ":updated etc");
				this.socket.on(modelName + ":saved", function(msg){
					console.log("socket.service on " + modelName + ":saved");
					cb('saved', msg);
				});
				this.socket.on(modelName + ":removed", function(msg){
					cb('removed', msg);
				});
				this.socket.on(modelName + ":updated", function(msg){
					console.log("socket.service on " + modelName + ":updated");
					cb('updated', msg);
				})
			},

			// Unsync the authe methods for a specific model name
			unsyncAuth : function(modelName) {
				// I removed this... I'm not sure this is necessary here.  It caused problems when
				// navigating away from a user profile page
				// this.socket.emit('logout');
				this.socket.removeAllListeners(modelName + ':auth:updated');
				this.socket.removeAllListeners(modelName + ':auth:logout');
				this.socket.removeAllListeners(modelName + ':authenticated');
			},

			// Unsync updates across all possible model / modleObj possibilities.
			// This doesn't however, take into account the auth: methods (maybe do that?)
			unsyncUpdates: function (modelName, modelObj) {
				this.socket.removeAllListeners(modelName + ':saved');
				this.socket.removeAllListeners(modelName + ':removed');
				this.socket.removeAllListeners(modelName + ':updated');
				if(modelObj){
					this.socket.removeAllListeners(modelName + ':' + modelObj._id + ':saved');
					this.socket.removeAllListeners(modelName + ':' + modelObj._id + ':removed');
					this.socket.removeAllListeners(modelName + ':' + modelObj._id + ':updated');
				}
			}
		};
		return Socket_v2;
	});

angular.module('ngLungeFullStack2App')
	.factory('CertificationSyncer', function($timeout, socket_v2, $cookieStore, $rootScope, Auth) {
		var CertificationSyncer = {
			syncUnauth : function(cb){
				cb = cb || angular.noop;
				if(!socket_v2.socket) {
					socket_v2.init();
				}
				// We only need to join the CertificationOrganization room, because every time we add a
				// certificationType, the associated certificationOrganization will be altered and hence emit a :saved
				socket_v2.socket.emit("joinRoom", "certificationOrganization");
				socket_v2.syncUpdates('certificationOrganization', cb);
				socket_v2.syncUpdates('certificationType', cb);
			},
			unsyncUnauth : function() {
				socket_v2.unsyncUpdates('certificaitonOrganization');

				socket_v2.unsyncUpdates('certificaitonType');
			}
		};
		return CertificationSyncer;
	});

angular.module('ngLungeFullStack2App')
	.factory('TrainerSyncer', function($timeout, socket_v2, $cookieStore, $rootScope, Auth) {
		var TrainerSyncer = {
			// When we're syncing to an actual token, we create a new socket and authenticate it,
			// Then we attach some more methods such as _onLogout()
			syncAuth : function(token) {
				//alert("ontime");
				socket_v2.init(token);
				socket_v2.socket.on('trainer:authenticated', this._onAuthenticated);
				//socket_v2.socket.on('trainer:' + Auth.getCurrentUser()._id + ':updated', this._onUpdated);
				socket_v2.socket.on('trainer:auth:updated', this._onAuthUpdated);
				socket_v2.socket.on('message', function(message){
					console.log("Message:", message);
					alert("NEW MESSAGE");
				})
			},
			unsyncAuth : function(){
				console.log("Socket (TrainerSyncer) is unsyncing the socket methods so that they don't get double-" +
					"bound if we log-in again");
				// unsync the trainer so events do not get double-bound when we happen to log-in again.
				socket_v2.unsyncAuth('trainer');
			},
			// When we're just syncing this socket on a general :updated trainer method.
			// for example, when we're on their profile page
			syncUnauth : function(modelObj, cb) {
				cb = cb || angular.noop;
				if(!socket_v2.socket) {
					socket_v2.init();
				}
				console.log(" [+] Socket is joining the syncUnauth room for: ", "trainer:" + modelObj._id);
				socket_v2.socket.emit("joinRoom", "trainer:" + modelObj._id);
				// note - we remove this listener in TrainerFactory
				// TrainerFactory.unsyncModel removes this listener by calling FullMetalSocket.trainer.unsyncUnauth
				//socket_v2.syncUpdates('trainer', function(msg){
				//	console.log("TrainerSyncer.unauthSync() callback, make sure this does not fire repeatedly. " +
				//	"Should sync with user: ", msg.email);
				//	cb('updated', msg);
				//});
				socket_v2.socket.on("trainer:" + modelObj._id + ":updated" , function(msg){
					// IF this fires repeatedly it means that the scope did not destroy the listeners when the scope
					// itself was destroyed.  Must do that.
					console.log("Socket - TrainerSyncer.unauthSync() callback, make sure this does not fire" +
						" repeatedly. " +
						"Should sync with user: ", msg.email);
					cb('updated', msg);
				});
			},

			// unsync the unauth'ed listeners.
			unsyncUnauth : function(modelObj){
				console.log(" [-] Socket is leaving the syncUnauth room for: ", "trainer:" + modelObj._id);
				socket_v2.socket.emit("leaveRoom", "trainer:" + modelObj._id);
				socket_v2.unsyncUpdates('trainer', modelObj);
			},

			_onAuthUpdated : function(modelObj) {
				console.log(" [Socket - Authenticated Update] we have just updated a logged in trainer socket");
				Auth.setCurrentUser(modelObj);
			},

			_onAuthenticated : function(modelObj) {
				socket_v2.socket.on("trainer:auth:logout", TrainerSyncer._onLogout);
			},

			// When a trainer:auth:logout message is received from server
			_onLogout : Auth.logoutBySocket,

			logout : function(trainer) {
				socket_v2.socket.emit('logout', trainer);
			}
		};
		return TrainerSyncer;
	});

myApp.factory('ChatSocket', function(socket_v2, $rootScope) {
	var ChatSocket = {
		joinChat : function(chatId) {
			var roomName = 'chat:' + chatId;
			if(socket_v2.inRoom(roomName)) {
				console.log("Socket already in room " + roomName + ", not binding socket events");
				return false;
			}
			socket_v2.checkAuthentication().then(function(isAuthenticated) {
				var socket = socket_v2.socket,
					rooms = socket_v2.rooms;
				socket.removeAllListeners('chat:' + chatId + ':joined');
				// tells the server to check for the chat room, if I'm a member
				socket.emit('joinChat', chatId);
				// when the server returns... join the chat
				socket.on('chat:' + chatId + ':joined', function () {
					console.log("[ChatSocket] successfully joined chat room with id: ", chatId);
					rooms.push(roomName);
					console.log("Binding on chat:" + chatId + ":message to have an event");
					socket.on('chat:' + chatId + ":message", function(message){
						ChatSocket.onMessage(chatId, message);
					})
				})
			});
		},
		leaveChat : function(chatId) {
			console.log("[ChatSocket] calling unsync chat room with id: ", chatId);
			socket_v2.leaveRoom('chat:' + chatId);
			socket_v2.socket.removeAllListeners('chat:' + chatId + ':message');
		},
		onMessage : function(chatId, message) {
			console.log("[ChatSocket] received through socket the message:", message);
			$rootScope.$broadcast('chat:' + chatId + ':message', message);
		}
	};
	return ChatSocket;
});

angular.module('ngLungeFullStack2App')
	.factory('UserSyncer', function($timeout, socket_v2, $cookieStore, $rootScope, Auth) {
		var UserSyncer = {
			// When we're syncing to an actual token, we create a new socket and authenticate it,
			// Then we attach some more methods such as _onLogout()
			syncAuth : function(token) {
				socket_v2.init(token);
				socket_v2.socket.on('user:authenticated', this._onAuthenticated);
				//socket_v2.socket.on('trainer:' + Auth.getCurrentUser()._id + ':updated', this._onUpdated);
				socket_v2.socket.on('user:auth:updated', this._onAuthUpdated);
				// socket_v2.socket.on('message', function(message){
				// 	console.log("Message:", message);
				// 	alert("NOOOOOOOOO NEW MESSAGE");
				// })
			},
			unsyncAuth : function(){
				console.log("Socket (TrainerSyncer) is unsyncing the socket methods so that they don't get double-" +
					"bound if we log-in again");
				// unsync the trainer so events do not get double-bound when we happen to log-in again.
				socket_v2.unsyncAuth('user');
			},
			// When we're just syncing this socket on a general :updated trainer method.
			// for example, when we're on their profile page
			syncUnauth : function(modelObj, cb) {
				cb = cb || angular.noop;
				if(!socket_v2.socket) {
					socket_v2.init();
				}
				console.log(" [+] Socket is joining the syncUnauth room for: ", "user:" + modelObj._id);
				// var e = new Error();
				// console.log(e.stack);
				// socket_v2.socket.emit("joinRoom", "user:" + modelObj._id);
				socket_v2.joinRoom('user:' + modelObj._id);
				socket_v2.socket.on("user:" + modelObj._id + ":updated" , function(msg){
					// IF this fires repeatedly it means that the scope did not destroy the listeners when the scope
					// itself was destroyed.  Must do that.
					console.log("Socket - UserSyncer.unauthSync() callback, make sure this does not fire" +
						" repeatedly. " +
						"Should sync with user: ", msg.email);
					cb('updated', msg);
				});
			},

			// unsyncUnauthUserFactory : function(modelObj) {
			// 	console.log(" [-] Socket is leaving the syncUnauth room for: ", "user:" + modelObj._id);
			// 	socket_v2.socket.emit("leaveRoom", "user:" + modelObj._id);
			// 	socket_v2.unsyncUpdates('user', modelObj);
			// },

			syncUnauthUserFactory : function(userFactory) {
				if(!socket_v2.socket) {
					socket_v2.init();
				}
				var user = userFactory.user;
				if(!user || !user._id) {
					console.warn('attempting to sync a user factory without a user');
					return;
				}
				console.log(" [+] Socket is joining the syncUnauth room for: ", "user:" + user._id);
				// var e = new Error();
				// console.log(e.stack);
				// socket_v2.socket.emit("joinRoom", "user:" + modelObj._id);
				socket_v2.joinRoom('user:' + user._id);
				socket_v2.socket.on("user:" + user._id + ":updated" , function(msg){
					// IF this fires repeatedly it means that the scope did not destroy the listeners when the scope
					// itself was destroyed.  Must do that.
					console.log("Socket - UserSyncer.unauthSync() callback, make sure this does not fire" +
						" repeatedly. " +
						"Should sync with user: ", msg.email);
					userFactory.init(msg);
				});
			},

			// unsync the unauth'ed listeners.
			unsyncUnauthUserFactory : function(modelObj){
				console.log(" [-] Socket is leaving the syncUnauth room for: ", "user:" + modelObj._id);
				// socket_v2.socket.emit("leaveRoom", "user:" + modelObj._id);
				socket_v2.leaveRoom('user:' + modelObj._id);
				socket_v2.unsyncUpdates('user', modelObj);
			},

			_onAuthUpdated : function(modelObj) {
				console.log(" [Socket - User Authenticated Update] we have just updated a logged in trainer socket" +
					" with current user now: ", modelObj);
				Auth.setCurrentUser(modelObj);
			},

			_onAuthenticated : function(modelObj) {
				socket_v2.isAuthenticated = socket_v2.authenticated = true;
				socket_v2.socket.removeAllListeners("user:auth:logout");
				socket_v2.socket.on("user:auth:logout", UserSyncer._onLogout);
			},

			// syncChatRoom : function(chatRoomId) {
			// 	console.log("[Socket] calling sync chat room with id: ", chatRoomId);
			// 	if(!socket_v2.socket) {
			// 		socket_v2.init();
			// 	}
			// 	socket_v2.joinRoom('chat:' + chatRoomId);
			//
			// },
			//
			// unsyncChatRoom : function(chatRoomId) {
			// 	console.log("[Socket] calling un-sync chat room with id: ", chatRoomId);
			// 	socket_v2.leaveRoom('chat:' + chatRoomId);
			// },
			// When a trainer:auth:logout message is received from server
			_onLogout : function() {
				socket_v2.socket.removeAllListeners();
				socket_v2.isAuthenticated = false;
				Auth.logoutBySocket();
			},

			logout :function(user) {
				socket_v2.socket.emit('logout', user);
			}

		};
		return UserSyncer;
	});
angular.module('ngLungeFullStack2App')
	.factory('FullMetalSocket', function(UserSyncer, socket_v2, TrainerSyncer, Auth, CertificationSyncer) {
		//socket_v2.init();
		var FullMetalSocketOverrides = {
			testConnect : function() {
				if(!socket_v2.socket) {
					socket_v2.init();
				}
			},
			testDisconnect : function() {

			}
		};
		var FullMetalSocket = angular.extend(
			{ trainer : TrainerSyncer },
			{ user : UserSyncer },
			{ certification : CertificationSyncer },
			FullMetalSocketOverrides, {}
		);
		//console.log("FullMetalSocket is:", FullMetalSocket);
		Auth.setFullMetalSocket(FullMetalSocket);
		return FullMetalSocket;
	});
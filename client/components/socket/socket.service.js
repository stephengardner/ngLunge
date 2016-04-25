/* global io */
'use strict';
angular.module('ngLungeFullStack2App')
	.factory('socket_v2', function(socketFactory) {
		/*
		 var ioSocket = io('', {
		 // Send auth token on connection, you will need to DI the Auth service above
		 query: 'token=' + Auth.getToken(),
		 path: '/socket.io-client',
		 transports: ['websocket'] // ON PAAS (heroku) we cannot use Polling
		 });
		 */
		var ioSocket;
		var socket;
		var Socket_v2 = {
			ioSocket : false,
			token : false,

			// Initialize the socket, it can come with a blank query token (unauthed).
			init : function(token){
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
					cb('saved', msg);
				})
				this.socket.on(modelName + ":removed", function(msg){
					cb('removed', msg);
				})
				this.socket.on(modelName + ":updated", function(msg){
					console.log("socket.service on " + modelName + ":updated");
					cb('updated', msg);
				})
			},

			// Unsync the authe methods for a specific model name
			unsyncAuth : function(modelName) {
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
					console.log("TrainerSyncer.unauthSync() callback, make sure this does not fire repeatedly. " +
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

angular.module('ngLungeFullStack2App')
	.factory('FullMetalSocket', function(socket_v2, TrainerSyncer, Auth, CertificationSyncer) {
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
		var FullMetalSocket = angular.extend({ trainer : TrainerSyncer }, {certification : CertificationSyncer}, FullMetalSocketOverrides, {});
		//console.log("FullMetalSocket is:", FullMetalSocket);
		Auth.setFullMetalSocket(FullMetalSocket);
		return FullMetalSocket;
	});

/*
 angular.module('ngLungeFullStack2App')
 .factory('socket', function(Auth, socketFactory, $templateCache) {
 // socket.io now auto-configures its connection when we ommit a connection url
 var ioSocket = io('', {
 // Send auth token on connection, you will need to DI the Auth service above
 query: 'token=' + Auth.getToken(),
 path: '/socket.io-client',
 transports: ['websocket'] // ON PAAS (heroku) we cannot use Polling
 });

 var socket = socketFactory({
 ioSocket: ioSocket
 });
 Auth.setSocket(socket);
 var SocketObj = {
 init : function() {
 ioSocket = io('', {
 // Send auth token on connection, you will need to DI the Auth service above
 query: 'token=' + Auth.getToken(),
 path: '/socket.io-client',
 transports: ['websocket'] // ON PAAS (heroku) we cannot use Polling
 });
 socket = socketFactory({
 ioSocket: ioSocket
 });
 this.socket = socket;
 },
 socket: socket,
 sync : {
 user : function(modelName, modelObj, cb) {
 cb = cb || angular.noop;
 var socketEmitString = "joinRoom: '" + modelName + ":" + modelObj._id + "'";
 console.log("Socket emitting : " + socketEmitString, " for : ", modelObj);
 socket.emit("joinRoom", modelName + ":" + modelObj._id);
 var event = "updated";
 socket.on(modelName + ":" + modelObj._id + ":updated" , function(msg){
 cb(event, msg);
 });
 },
 profilePage : function(modelName, modelObj, cb) {
 cb = cb || angular.noop;
 socket.emit("joinRoom", modelName + ":" + modelObj._id);
 var event = "updated";
 socket.on(modelName + ":" + modelObj._id + ":updated" , function(msg){
 cb(event, msg);
 })
 },
 certification : function(cb) {
 cb = cb || angular.noop;
 socket.emit("joinRoom", 'certificationType');
 socket.emit("joinRoom", 'certificationOrganization');
 var event = "updated";
 function onChanged(msg) {
 console.log(msg);
 cb(event, msg);
 }
 // can coalesce these into :updated event.  Right now we're not doing anything different
 // on saved vs removed, but technically we could.
 socket.on("certificationType:saved" , onChanged);
 socket.on("certificationType:removed" , onChanged);
 socket.on("certificationType:updated" , onChanged);
 // Also watch changed on the Certification model
 socket.on("certificationOrganization:saved" , onChanged);
 socket.on("certificationOrganization:removed" , onChanged);
 socket.on("certificationOrganization:updated" , onChanged);
 }
 },
 unsync : {
 user : function(modelName, modelObj) {
 socket.removeAllListeners(modelName + ":" + modelObj._id + ":updated");
 },
 profilePage : function(modelName, modelObj) {
 socket.removeAllListeners(modelName + ":" + modelObj._id + ":updated");
 },
 certification : function(){
 socket.removeAllListeners('certificationType:saved');
 socket.removeAllListeners('certificationType:removed');
 socket.removeAllListeners('certificationType:updated');
 socket.removeAllListeners('certificationOrganization:saved');
 socket.removeAllListeners('certificationOrganization:removed');
 socket.removeAllListeners('certificationOrganization:updated');
 }
 },
 syncCurrentUser : function(modelName, cb) {
 cb = cb || angular.noop;
 socket.on(modelName + ':save', function (newUser) {
 var event = "updated";
 Auth.setCurrentUser(newUser);
 cb(event, newUser);
 });
 },
 syncUser : function(modelName, cb) {
 cb = cb || angular.noop;
 var event = "updated";
 socket.on(modelName + ':save', function (newUser) {
 cb(event, newUser);
 });
 },
 syncProfilePage : function(modelName, user, cb) {
 console.log("syncing profile page on model:", modelName, " user: ", user);
 cb = cb || angular.noop;
 socket.on(modelName + ':' + user._id + ':save', function(item) {
 alert("FUUUUUCK YEAH");
 });
 },
 syncUpdates: function (modelName, array, cb) {
 console.log("syncing updates on model:", modelName, " array: ", array);
 cb = cb || angular.noop;

 socket.on(modelName + ':save', function (item) {
 console.log("saving updates on item type:", typeof item, "and item: ", item, " and array: ", array);
 var oldItem = _.find(array, {_id: item._id});
 var index = array.indexOf(oldItem);
 var event = 'created';

 // replace oldItem if it exists
 // otherwise just add item to the collection
 if (oldItem) {
 array.splice(index, 1, item);
 event = 'updated';
 } else {
 array.push(item);
 }

 cb(event, item, array);
 });

 socket.on(modelName + ':remove', function (item) {
 var event = 'deleted';
 _.remove(array, {_id: item._id});
 cb(event, item, array);
 });
 },

 unsyncUpdates: function (modelName) {
 socket.removeAllListeners(modelName + ':save');
 socket.removeAllListeners(modelName + ':remove');
 socket.removeAllListeners(modelName + ':updated');
 }
 };

 Auth.setSocketFactory(SocketObj);
 return SocketObj
 });
 */

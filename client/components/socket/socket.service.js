/* global io */
'use strict';

angular.module('ngLungeFullStack2App')
	.factory('socket', function(Auth, socketFactory) {

		// socket.io now auto-configures its connection when we ommit a connection url
		var ioSocket = io('', {
			// Send auth token on connection, you will need to DI the Auth service above
			query: 'token=' + Auth.getToken()
			,path: '/socket.io-client'
		});

		var socket = socketFactory({
			ioSocket: ioSocket
		});
		Auth.setSocket(socket);
		var SocketObj = {
			socket: socket,
			sync : {
				user : function(modelName, modelObj, cb) {
					cb = cb || angular.noop;
					var socketEmitString = "joinRoom: '" + modelName + ":" + modelObj._id + "'";
					console.log("Socket emitting : " + socketEmitString, " for : ", modelObj);
					socket.emit("joinRoom", modelName + ":" + modelObj._id);
					var event = "updated";
					socket.on(modelName + ":" + modelObj._id + ":updated" , function(msg){
						alert("socket.service.sinc.user: FUCKING UPDATED");
						cb(event, msg);
					})
				},
				profilePage : function(modelName, modelObj, cb) {
					cb = cb || angular.noop;
					socket.emit("joinRoom", modelName + ":" + modelObj._id);
					var event = "updated";
					socket.on(modelName + ":" + modelObj._id + ":updated" , function(msg){
						cb(event, msg);
					})
				}
			},
			unsync : {
				user : function(modelName, modelObj) {
					socket.removeAllListeners(modelName + ":" + modelObj._id + ":updated");
				},
				profilePage : function(modelName, modelObj) {
					socket.removeAllListeners(modelName + ":" + modelObj._id + ":updated");
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
			/**
			 * Register listeners to sync an array with updates on a model
			 *
			 * Takes the array we want to sync, the model name that socket updates are sent from,
			 * and an optional callback function after new items are updated.
			 *
			 * @param {String} modelName
			 * @param {Array} array
			 * @param {Function} cb
			 */
			syncUpdates: function (modelName, array, cb) {
				console.log("syncing updates on model:", modelName, " array: ", array);
				cb = cb || angular.noop;

				/**
				 * Syncs item creation/updates on 'model:save'
				 */
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

				/**
				 * Syncs removed items on 'model:remove'
				 */
				socket.on(modelName + ':remove', function (item) {
					var event = 'deleted';
					_.remove(array, {_id: item._id});
					cb(event, item, array);
				});
			},

			/**
			 * Removes listeners for a models updates on the socket
			 *
			 * @param modelName
			 */
			unsyncUpdates: function (modelName) {
				socket.removeAllListeners(modelName + ':save');
				socket.removeAllListeners(modelName + ':remove');
				socket.removeAllListeners(modelName + ':updated');
			}
		};

		Auth.setSocketFactory(SocketObj);
		if(Auth.isLoggedIn){
			Auth.syncAfterLogin();
		}
		return SocketObj
	});

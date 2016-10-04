/* global io */
'use strict';
var io; // just a fix to remove the warning we get from typescript for socket.io
var LogPrefixer = (function () {
    function LogPrefixer() {
    }
    LogPrefixer.prototype.prefix = function (prefix) {
        var oldConsole = console.log;
        Array.prototype.unshift.call(arguments, "[" + prefix + "] ");
        return oldConsole.apply(this, arguments);
    };
    return LogPrefixer;
}());
angular.module('myApp').service('LogPrefixer', LogPrefixer);
var SocketV2 = (function () {
    function SocketV2($q, socketFactory, $rootScope) {
        this.$q = $q;
        this.socketFactory = socketFactory;
        this.$rootScope = $rootScope;
        this._authenticationStatus = 'ready'; // ready, pending, authenticated
        this._resetAuthenticatePromise();
        this._init();
        this.rooms = [];
    }
    SocketV2.log = function () {
        var optionalParams = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            optionalParams[_i - 0] = arguments[_i];
        }
        var prefix = 'SocketV2', oldConsole = console.log;
        Array.prototype.unshift.call(arguments, "[" + prefix + "] ");
        oldConsole.apply(this, arguments);
    };
    ;
    SocketV2.prototype._resetAuthenticatePromise = function () {
        var _this = this;
        this._authenticationStatus = 'ready';
        this._authenticatePromise = this.$q(function (resolve, reject) {
            _this._authenticatePromiseResolve = resolve;
            _this._authenticatePromiseReject = reject;
        });
    };
    SocketV2.prototype._init = function (token) {
        SocketV2.log("initializing socket");
        this._ioSocket = io('', {
            // Send auth token on connection, you will need to DI the Auth service above
            //forceNew: true,
            query: 'token=' + token,
            path: '/socket.io-client',
            transports: ['websocket'] // ON PAAS (heroku) we cannot use Polling
        });
        this._socket = this.socketFactory({
            ioSocket: this._ioSocket
        });
        this._socket.on('reconnect', this._reconnect.bind(this));
    };
    SocketV2.prototype.authenticate = function (token, forceReset) {
        var _this = this;
        var tokenHasChanged = token && this._token && token != this._token;
        if (forceReset || tokenHasChanged) {
            console.log("the socket", this._socket);
            // I'm calling init here because if the token changed that means i believe that we've RESET
            // this socket connection, and you cant connect with it anymore.... ?????
            this._init();
            if (forceReset) {
                console.warn("[SocketV2] force reset has been called");
            }
            else
                console.warn("[SocketV2] Woah nelly, were logging in as someone else, the tokens changed!  Potential \n                problem...");
            this._resetAuthenticatePromise();
        }
        this._token = token;
        if (this._authenticationStatus == 'pending')
            return this._authenticatePromise;
        this._authenticationStatus = 'pending';
        SocketV2.log('emitting custom-authenticate with token ? yes/no: ' + !!this._token);
        this._socket.on('user:authenticated', function () {
            SocketV2.log('received user:authenticated message from server');
            _this._authenticationStatus = 'authenticated';
            _this._authenticatePromiseResolve();
        });
        this._socket.emit('custom-authenticate', { token: this._token });
        return this._authenticatePromise;
    };
    SocketV2.prototype.isInRoom = function (room) {
        for (var i = 0; i < this.rooms.length; i++) {
            var roomAtIndex = this.rooms[i];
            if (roomAtIndex == room) {
                return true;
            }
        }
        return false;
    };
    SocketV2.prototype.leaveRoom = function (room) {
        SocketV2.log("leaving room \"" + room + "\"");
        this._socket.emit("leaveRoom", room);
        for (var i = 0; i < this.rooms.length; i++) {
            var roomAtIndex = this.rooms[i];
            if (roomAtIndex == room) {
                this.rooms.splice(i, 1);
                return;
            }
        }
    };
    SocketV2.prototype.joinRoom = function (room) {
        if (this.isInRoom(room)) {
            console.warn("[SocketV2] joining a room multiple times... this shouldnt happen.  Room: " + room);
        }
        SocketV2.log("joining room \"" + room + "\"");
        this._socket.emit("joinRoom", room);
        this.rooms.push(room);
    };
    SocketV2.prototype._rejoinAllRooms = function () {
        SocketV2.log("rejoining all rooms triggered");
        for (var i = 0; i < this.rooms.length; i++) {
            var room = this.rooms[i];
            this._socket.emit('joinRoom', room);
        }
    };
    SocketV2.prototype._reconnect = function () {
        var _this = this;
        SocketV2.log("reconnect event triggered");
        this.authenticate(this._token, true).then(function () {
            _this._rejoinAllRooms();
        });
    };
    SocketV2.prototype.watchModelChanges = function (model, callback) {
        var savedMessageEvent = model + ":saved", updatedMessageEvent = model + ":updated", removedMessageEvent = model + ":removed";
        this._socket.on(savedMessageEvent, function (msg) {
            callback('saved', msg);
        });
        this._socket.on(updatedMessageEvent, function (msg) {
            callback('updated', msg);
        });
        this._socket.on(removedMessageEvent, function (msg) {
            callback('removed', msg);
        });
    };
    SocketV2.prototype.unwatchModelChanges = function (model) {
        var savedMessageEvent = model + ":saved", updatedMessageEvent = model + ":updated", removedMessageEvent = model + ":removed";
        this._socket.removeAllListeners(savedMessageEvent);
        this._socket.removeAllListeners(updatedMessageEvent);
        this._socket.removeAllListeners(removedMessageEvent);
    };
    SocketV2.prototype.unsyncModelAuth = function (model) {
        var authUpdatedMessage = model + ":auth:updated", authLogoutMessage = model + ":auth:logout", authenticatedMessage = model + ":authenticated";
        this._socket.removeAllListeners(authUpdatedMessage);
        this._socket.removeAllListeners(authLogoutMessage);
        this._socket.removeAllListeners(authenticatedMessage);
    };
    SocketV2.prototype.onLogout = function () {
        this._resetAuthenticatePromise();
    };
    SocketV2.prototype.logout = function () {
        this.onLogout();
        this.unsyncModelAuth('user');
    };
    SocketV2.$inject = ['$q', 'socketFactory', '$rootScope'];
    return SocketV2;
}());
angular.module('myApp').service('SocketV2', SocketV2);
angular.module('myApp')
    .factory('CertificationSyncer', function ($timeout, SocketV2, $cookieStore, $rootScope) {
    var CertificationSyncer = {
        syncUnauth: function (cb) {
            cb = cb || angular.noop;
            // SocketV2
            // if(!socket_v2.socket) {
            // socket_v2.init();
            // }
            // We only need to join the CertificationOrganization room, because every time we add a
            // certificationType, the associated certificationOrganization will be altered and hence emit a :saved
            SocketV2.join('certificationOrganization');
            SocketV2.on('certificationOrganization:saved');
            SocketV2.watchModelChanges('certificationOrganization', cb);
            SocketV2.watchModelChanges('certificationType', cb);
        },
        unsyncUnauth: function () {
            SocketV2.unwatchModelChanges('certificationOrganization');
            SocketV2.unwatchModelChanges('certificationType');
        }
    };
    return CertificationSyncer;
});
angular.module('myApp').factory('ChatSocket', function (SocketV2, $rootScope) {
    var ChatSocket = {
        joinChat: function (chatId) {
            var roomName = 'chat:' + chatId;
            if (SocketV2.isInRoom(roomName)) {
                console.log("Socket already in room " + roomName + " + \", not binding socket events");
                return false;
            }
            SocketV2.authenticate().then(function () {
                var socket = SocketV2._socket, joinedRoomEvent = "chat:" + chatId + ":joined";
                socket.removeAllListeners(joinedRoomEvent);
                socket.emit('joinChat', chatId);
                socket.on(joinedRoomEvent, function () {
                    console.log("successfully joined chat room with id " + chatId);
                    var newMessageEvent = "chat:" + chatId + ":message", messageSeenEvent = "chat:" + chatId + ":message-seen", messagePreviewUpdateEvent = "chat:" + chatId + ":message-preview-update";
                    SocketV2.rooms.push(roomName);
                    socket.on(newMessageEvent, function (message) {
                        ChatSocket.onMessage(chatId, message);
                    });
                    socket.on(messageSeenEvent, function (message) {
                        ChatSocket.onMessageSeen(chatId, message);
                    });
                    socket.on(messagePreviewUpdateEvent, function (message) {
                        ChatSocket.onMessagePreviewUpdate(chatId, message);
                    });
                });
            });
        },
        leaveChat: function (chatId) {
            console.log("[ChatSocket] calling unsync chat room with id: ", chatId);
            SocketV2.leaveRoom("chat:" + chatId);
            SocketV2._socket.removeAllListeners("chat:" + chatId + ":message");
            // socket_v2.leaveRoom('chat:' + chatId);
            // socket_v2.socket.removeAllListeners('chat:' + chatId + ':message');
        },
        onMessage: function (chatId, message) {
            console.log("[ChatSocket] received through socket the message:", message.message);
            $rootScope.$broadcast('chat:' + chatId + ':message', message);
        },
        onMessageSeen: function (chatId, message) {
            console.log("[ChatSocket] received through socket the message seen notification for message:", message.message);
            $rootScope.$broadcast('chat:' + chatId + ':message-seen', message);
        },
        onMessagePreviewUpdate: function (chatId, message) {
            console.log("[ChatSocket] received through socket the message preview update notification for message:", message.last_message_text);
            $rootScope.$broadcast('chat:' + chatId + ':message-preview-update', message);
            // $rootScope.$broadcast('chat:' + chatId + ':message-seen', message);
        }
    };
    return ChatSocket;
});
angular.module('myApp').factory('UserReviewsSocket', function (SocketV2, $rootScope) {
    var UserReviewsSocket = {
        roomPrefix: 'user-reviews',
        createRoomName: function (userId) {
            return this.roomPrefix + ':' + userId;
        },
        watchReviewUpdatesForUser: function (userId, callback) {
            var eventSuffix = 'review-updated', roomName = this.createRoomName(userId), eventName = 'review-updated';
            if (SocketV2.isInRoom(roomName))
                return console.log(this.roomPrefix + " socket already in room " + roomName + ", not binding socket" +
                    " events");
            var socket = SocketV2._socket, rooms = SocketV2.rooms;
            socket.emit('joinRoom', roomName);
            socket.removeAllListeners(eventName);
            socket.on(eventName, callback);
        },
        unwatchReviewUpdatesForUser: function (userId) {
            // console.log("[ChatSocket] calling unsync chat room with id: ", chatId);
            // socket_v2.leaveRoom('chat:' + chatId);
            // socket_v2.socket.removeAllListeners('chat:' + chatId + ':message');
        },
        onMessage: function (chatId, message) {
            console.log("[ChatSocket] received through socket the message:", message);
            $rootScope.$broadcast('chat:' + chatId + ':message', message);
        },
        onMessageSeen: function (chatId, message) {
            console.log("[ChatSocket] received through socket the message seen notification for message:", message);
            $rootScope.$broadcast('chat:' + chatId + ':message-seen', message);
        },
        onMessagePreviewUpdate: function (chatId, message) {
            console.log("[ChatSocket] received through socket the message preview update notification for message:", message);
            $rootScope.$broadcast('chat:' + chatId + ':message-preview-update', message);
        }
    };
    return UserReviewsSocket;
});
var UserSyncer = (function () {
    function UserSyncer(Chat, SocketV2, $rootScope, Auth) {
        this.Chat = Chat;
        this.SocketV2 = SocketV2;
        this.$rootScope = $rootScope;
        this.Auth = Auth;
        // this.log = LogPrefixer(this.constructor.name);
    }
    UserSyncer.log = function () {
        var optionalParams = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            optionalParams[_i - 0] = arguments[_i];
        }
        var prefix = 'UserSyncer', oldConsole = console.log;
        Array.prototype.unshift.call(arguments, "[" + prefix + "] ");
        oldConsole.apply(this, arguments);
    };
    ;
    UserSyncer.prototype.syncAuth = function (token) {
        var _this = this;
        var onAuthenticatedMessage = "user:authenticated", onAuthUpdatedMessage = "user:auth:updated";
        UserSyncer.log('attempting to sync auth message callbacks');
        this.SocketV2.authenticate(token).then(function () {
            UserSyncer.log('auth message callbacks synced');
            _this.SocketV2._socket.on(onAuthenticatedMessage, _this._onAuthenticated.bind(_this));
            _this.SocketV2._socket.on(onAuthUpdatedMessage, _this._onAuthUpdated.bind(_this));
        });
        // this.SocketV2._socket.removeAllListeners(onAuthenticatedMessage);
        // this.SocketV2._socket.removeAllListeners(onAuthUpdatedMessage);
    };
    UserSyncer.prototype.unsyncAuth = function () {
        UserSyncer.log("Socket (TrainerSyncer) is unsyncing the socket methods so that they don't get double-" +
            "bound if we log-in again");
        // unsync the trainer so events do not get double-bound when we happen to log-in again.
        this.SocketV2.unsyncModelAuth('user');
    };
    UserSyncer.prototype.syncUnauth = function (modelObj, cb) {
        cb = cb || angular.noop;
        UserSyncer.log("joining the user sync unauth room for user: " + modelObj._id);
        var roomName = "user:" + modelObj._id, updatedMessage = "user:" + modelObj._id + ":updated";
        this.SocketV2.joinRoom(roomName);
        this.SocketV2._socket.on(updatedMessage, function (msg) {
            UserSyncer.log("UserSyncer.unauthSync() callback, make sure this does not fire" +
                " repeatedly. Should sync with user: ", msg.email);
            cb('updated', msg);
        });
    };
    UserSyncer.prototype.syncUnauthUserFactory = function (userFactory) {
        var user = userFactory.user, roomName = "user:" + user._id, updatedMessage = "user:" + user._id + ":updated";
        if (!user || !user._id) {
            console.error('[UserSyncer] attempting to sync a user factory without a user');
            return;
        }
        this.SocketV2.joinRoom(roomName);
        this.SocketV2._socket.on(updatedMessage, function (msg) {
            UserSyncer.log("UserSyncer.unauthSync() callback, make sure this does not fire repeatedly. \n            Should sync with user: " + msg.email);
            userFactory.init(msg);
        });
    };
    UserSyncer.prototype.unsyncUnauthUserFactory = function (userFactory) {
        if (!userFactory.user || !userFactory.user._id) {
            console.error('[UserSyncer] attempting to unsync a user factory with no user');
        }
        this.SocketV2.leaveRoom("user:" + userFactory.user._id);
        this.SocketV2.unwatchModelChanges('user', userFactory.user);
    };
    UserSyncer.prototype._onAuthUpdated = function (modelObj) {
        console.log("[Socket - User Authenticated Update] we have just updated a logged in trainer with id:" +
            modelObj._id);
        this.Auth.onSocketUpdatedMessage(modelObj);
    };
    UserSyncer.prototype._onAuthenticated = function (modelObj) {
        var userAuthLogoutMessage = "user:auth:logout", chatMessagePreviewUpdateMessage = "chat:message-preview-update";
        this.SocketV2._socket.removeAllListeners(userAuthLogoutMessage);
        this.SocketV2._socket.on("user:auth:logout", this._onLogout.bind(this));
        this.SocketV2._socket.removeAllListeners(chatMessagePreviewUpdateMessage);
        this.SocketV2._socket.on(chatMessagePreviewUpdateMessage, this._onChatPreviewUpdate.bind(this));
    };
    UserSyncer.prototype._onChatPreviewUpdate = function (message) {
        console.log("[User Socket] chat:message-preview-update message received for message: ", message.last_message_text);
        this.Chat.updatePreviewWebsocketMessageReceived(message);
    };
    UserSyncer.prototype._onLogout = function () {
        this.SocketV2._socket.removeAllListeners();
        this.SocketV2.onLogout();
        this.Auth.logoutBySocket();
    };
    UserSyncer.prototype.logout = function (user) {
        this.SocketV2._socket.emit('logout', user);
    };
    UserSyncer.$inject = ['Chat', 'SocketV2', '$rootScope', 'Auth'];
    return UserSyncer;
}());
angular.module('myApp').service('UserSyncer', UserSyncer);
angular.module('myApp')
    .factory('FullMetalSocket', function (UserSyncer, SocketV2, CertificationSyncer) {
    //socket_v2.init();
    var FullMetalSocketOverrides = {
        // testConnect : function() {
        // 	if(!socket_v2.socket) {
        // 		socket_v2.init();
        // 	}
        // },
        testDisconnect: function () {
        }
    };
    var FullMetalSocket = angular.extend(
    // { trainer : TrainerSyncer },
    { user: UserSyncer }, { certification: CertificationSyncer }, FullMetalSocketOverrides, {});
    return FullMetalSocket;
});

/* global io */
'use strict';
let io; // just a fix to remove the warning we get from typescript for socket.io

class LogPrefixer {
    constructor() {}
    public prefix(prefix) {
        let oldConsole = console.log;
        Array.prototype.unshift.call(arguments, `[${prefix}] `);
        return oldConsole.apply(this, arguments);
    }
}
angular.module('myApp').service('LogPrefixer', LogPrefixer);

class SocketV2 {
    static $inject = ['$q', 'socketFactory', '$rootScope'];
    static log(...optionalParams: any[]) {
        let prefix = 'SocketV2',
            oldConsole = console.log;
        Array.prototype.unshift.call(arguments, `[${prefix}] `);
        oldConsole.apply(this, arguments);
    };
    private _authenticationStatus = 'ready'; // ready, pending, authenticated
    private _authenticatePromise;
    private _authenticatePromiseResolve;
    private _authenticatePromiseReject;
    private _ioSocket;
    private _socket;
    private _token:string;
    public rooms:Array<any>;
    constructor(private $q, private socketFactory, private $rootScope) {
        this._resetAuthenticatePromise();
        this._init();
        this.rooms = [];
    }
    private _resetAuthenticatePromise() {
        this._authenticationStatus = 'ready';
        this._authenticatePromise = this.$q((resolve, reject) => {
            this._authenticatePromiseResolve = resolve;
            this._authenticatePromiseReject = reject;
        })
    }
    private _init(token?) {
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
    }
    public authenticate(token, forceReset?) {
        let tokenHasChanged = token && this._token && token != this._token;
        if(forceReset || tokenHasChanged) {
            console.log("the socket", this._socket);
            // I'm calling init here because if the token changed that means i believe that we've RESET
            // this socket connection, and you cant connect with it anymore.... ?????
            this._init();
            if(forceReset){
                console.warn(`[SocketV2] force reset has been called`);
            }
            else
                console.warn(`[SocketV2] Woah nelly, were logging in as someone else, the tokens changed!  Potential 
                problem...`);
            this._resetAuthenticatePromise();
        }
        this._token = token;
        if(this._authenticationStatus == 'pending') return this._authenticatePromise;
        this._authenticationStatus = 'pending';
        SocketV2.log('emitting custom-authenticate with token ? yes/no: ' + !!this._token);
        this._socket.on('user:authenticated', () => {
            SocketV2.log('received user:authenticated message from server');
            this._authenticationStatus = 'authenticated';
            this._authenticatePromiseResolve();
        });
        this._socket.emit('custom-authenticate', {token : this._token});
        return this._authenticatePromise;
    }
    public isInRoom(room:string) {
        for(var i = 0; i < this.rooms.length; i++) {
            var roomAtIndex = this.rooms[i];
            if(roomAtIndex == room) {
                return true;
            }
        }
        return false;
    }
    public leaveRoom(room:string) {
        SocketV2.log(`leaving room "${room}"`);
        this._socket.emit("leaveRoom", room);
        for(var i = 0; i < this.rooms.length; i++) {
            var roomAtIndex = this.rooms[i];
            if(roomAtIndex == room) {
                this.rooms.splice(i, 1);
                return;
            }
        }
    }
    public joinRoom(room:string) {
        if(this.isInRoom(room)){
            console.warn(`[SocketV2] joining a room multiple times... this shouldnt happen.  Room: ${room}`);
        }
        SocketV2.log(`joining room "${room}"`);
        this._socket.emit("joinRoom", room);
        this.rooms.push(room);
    }
    private _rejoinAllRooms() {
        SocketV2.log(`rejoining all rooms triggered`);
        for(var i = 0; i < this.rooms.length; i++) {
            var room = this.rooms[i];
            this._socket.emit('joinRoom', room);
        }
    }
    private _reconnect() {
        SocketV2.log("reconnect event triggered");
        this.authenticate(this._token, true).then(() => {
            this._rejoinAllRooms();
        });
    }
    public watchModelChanges(model:string, callback:Function) {
        let savedMessageEvent = `${model}:saved`,
            updatedMessageEvent = `${model}:updated`,
            removedMessageEvent = `${model}:removed`;
        this._socket.on(savedMessageEvent, (msg) => {
            callback('saved', msg);
        });
        this._socket.on(updatedMessageEvent, (msg) => {
            callback('updated', msg);
        });
        this._socket.on(removedMessageEvent, (msg) => {
            callback('removed', msg);
        });
    }
    public unwatchModelChanges(model:string) {
        let savedMessageEvent = `${model}:saved`,
            updatedMessageEvent = `${model}:updated`,
            removedMessageEvent = `${model}:removed`;
        this._socket.removeAllListeners(savedMessageEvent);
        this._socket.removeAllListeners(updatedMessageEvent);
        this._socket.removeAllListeners(removedMessageEvent);
    }
    public unsyncModelAuth(model:string) {
        let authUpdatedMessage = `${model}:auth:updated`,
            authLogoutMessage = `${model}:auth:logout`,
            authenticatedMessage = `${model}:authenticated`
            ;
        this._socket.removeAllListeners(authUpdatedMessage);
        this._socket.removeAllListeners(authLogoutMessage);
        this._socket.removeAllListeners(authenticatedMessage);
    }
    public onLogout() {
        this._resetAuthenticatePromise();
    }
    public logout() {
        this.onLogout();
        this.unsyncModelAuth('user');
    }
}
angular.module('myApp').service('SocketV2', SocketV2);

angular.module('myApp')
    .factory('CertificationSyncer', function($timeout, SocketV2, $cookieStore, $rootScope) {
        var CertificationSyncer = {
            syncUnauth : function(cb){
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
            unsyncUnauth : function() {
                SocketV2.unwatchModelChanges('certificationOrganization');
                SocketV2.unwatchModelChanges('certificationType');
            }
        };
        return CertificationSyncer;
    });
angular.module('myApp').factory('ChatSocket', function(SocketV2, $rootScope) {
    var ChatSocket = {
        joinChat : function(chatId) {
            let roomName = 'chat:' + chatId;
            if(SocketV2.isInRoom(roomName)) {
                console.log(`Socket already in room ${roomName} + ", not binding socket events`);
                return false;
            }
            SocketV2.authenticate().then(() => {
                let socket = SocketV2._socket,
                    joinedRoomEvent = `chat:${chatId}:joined`;
                socket.removeAllListeners(joinedRoomEvent);
                socket.emit('joinChat', chatId);
                socket.on(joinedRoomEvent, function(){
                    console.log(`successfully joined chat room with id ${chatId}`);
                    let newMessageEvent = `chat:${chatId}:message`,
                        messageSeenEvent = `chat:${chatId}:message-seen`,
                        messagePreviewUpdateEvent = `chat:${chatId}:message-preview-update`
                        ;
                    SocketV2.rooms.push(roomName);
                    socket.on(newMessageEvent, (message) => {
                        ChatSocket.onMessage(chatId, message);
                    });
                    socket.on(messageSeenEvent, (message) => {
                        ChatSocket.onMessageSeen(chatId, message);
                    });
                    socket.on(messagePreviewUpdateEvent, (message) => {
                        ChatSocket.onMessagePreviewUpdate(chatId, message);
                    });
                })
            });
        },
        leaveChat : function(chatId) {
            console.log("[ChatSocket] calling unsync chat room with id: ", chatId);
            SocketV2.leaveRoom(`chat:${chatId}`);
            SocketV2._socket.removeAllListeners(`chat:${chatId}:message`);
            // socket_v2.leaveRoom('chat:' + chatId);
            // socket_v2.socket.removeAllListeners('chat:' + chatId + ':message');
        },
        onMessage : function(chatId, message) {
            console.log("[ChatSocket] received through socket the message:", message.message);
            $rootScope.$broadcast('chat:' + chatId + ':message', message);
        },
        onMessageSeen : function(chatId, message) {
            console.log("[ChatSocket] received through socket the message seen notification for message:",
                message.message);
            $rootScope.$broadcast('chat:' + chatId + ':message-seen', message);
        },
        onMessagePreviewUpdate : function(chatId, message) {
            console.log("[ChatSocket] received through socket the message preview update notification for message:",
                message.last_message_text);
            $rootScope.$broadcast('chat:' + chatId + ':message-preview-update', message);
            // $rootScope.$broadcast('chat:' + chatId + ':message-seen', message);
        }
    };
    return ChatSocket;
});

angular.module('myApp').factory('UserReviewsSocket', function(SocketV2, $rootScope) {
    var UserReviewsSocket = {
        roomPrefix: 'user-reviews',
        createRoomName : function(userId) {
            return this.roomPrefix + ':' + userId;
        },
        watchReviewUpdatesForUser : function(userId, callback) {
            var eventSuffix = 'review-updated',
                roomName = this.createRoomName(userId),
                eventName = 'review-updated'
                ;
            if(SocketV2.isInRoom(roomName))
                return console.log(this.roomPrefix + " socket already in room " + roomName + ", not binding socket" +
                    " events");
            var socket = SocketV2._socket,
                rooms = SocketV2.rooms;
            socket.emit('joinRoom', roomName);
            socket.removeAllListeners(eventName);
            socket.on(eventName, callback);
        },
        unwatchReviewUpdatesForUser : function(userId) {
            // console.log("[ChatSocket] calling unsync chat room with id: ", chatId);
            // socket_v2.leaveRoom('chat:' + chatId);
            // socket_v2.socket.removeAllListeners('chat:' + chatId + ':message');
        },
        onMessage : function(chatId, message) {
            console.log("[ChatSocket] received through socket the message:", message);
            $rootScope.$broadcast('chat:' + chatId + ':message', message);
        },
        onMessageSeen : function(chatId, message) {
            console.log("[ChatSocket] received through socket the message seen notification for message:", message);
            $rootScope.$broadcast('chat:' + chatId + ':message-seen', message);
        },
        onMessagePreviewUpdate : function(chatId, message) {
            console.log("[ChatSocket] received through socket the message preview update notification for message:", message);
            $rootScope.$broadcast('chat:' + chatId + ':message-preview-update', message);
        }
    };
    return UserReviewsSocket;
});

class UserSyncer {
    static $inject = ['Chat', 'SocketV2', '$rootScope', 'Auth'];
    static log(...optionalParams: any[]) {
        let prefix = 'UserSyncer',
            oldConsole = console.log;
        Array.prototype.unshift.call(arguments, `[${prefix}] `);
        oldConsole.apply(this, arguments);
    };
    constructor(private Chat, private SocketV2, private $rootScope, private Auth) {
        // this.log = LogPrefixer(this.constructor.name);
    }
    public syncAuth(token:string) {
        let onAuthenticatedMessage = `user:authenticated`,
            onAuthUpdatedMessage = `user:auth:updated`
            ;
        UserSyncer.log('attempting to sync auth message callbacks');
        this.SocketV2.authenticate(token).then(() => {
            UserSyncer.log('auth message callbacks synced');
            this.SocketV2._socket.on(onAuthenticatedMessage, this._onAuthenticated.bind(this));
            this.SocketV2._socket.on(onAuthUpdatedMessage, this._onAuthUpdated.bind(this));
        });
        // this.SocketV2._socket.removeAllListeners(onAuthenticatedMessage);
        // this.SocketV2._socket.removeAllListeners(onAuthUpdatedMessage);
    }
    public unsyncAuth() {
        UserSyncer.log("Socket (TrainerSyncer) is unsyncing the socket methods so that they don't get double-" +
            "bound if we log-in again");
        // unsync the trainer so events do not get double-bound when we happen to log-in again.
        this.SocketV2.unsyncModelAuth('user');
    }
    public syncUnauth(modelObj, cb:Function) {
        cb = cb || angular.noop;
        UserSyncer.log("joining the user sync unauth room for user: " + modelObj._id);
        let roomName = `user:${modelObj._id}`,
            updatedMessage = `user:${modelObj._id}:updated`
            ;
        this.SocketV2.joinRoom(roomName);
        this.SocketV2._socket.on(updatedMessage, (msg) => {
            UserSyncer.log("UserSyncer.unauthSync() callback, make sure this does not fire" +
                " repeatedly. Should sync with user: ", msg.email);
            cb('updated', msg);
        });
    }
    public syncUnauthUserFactory(userFactory) {
        let user = userFactory.user,
            roomName = `user:${user._id}`,
            updatedMessage = `user:${user._id}:updated`;
        if(!user || !user._id) {
            console.error('[UserSyncer] attempting to sync a user factory without a user');
            return;
        }
        this.SocketV2.joinRoom(roomName);
        this.SocketV2._socket.on(updatedMessage, (msg) => {
            UserSyncer.log(`UserSyncer.unauthSync() callback, make sure this does not fire repeatedly. 
            Should sync with user: ${msg.email}`);
            userFactory.init(msg);
        });
    }
    public unsyncUnauthUserFactory(userFactory) {
        if(!userFactory.user || !userFactory.user._id) {
            console.error('[UserSyncer] attempting to unsync a user factory with no user')
        }
        this.SocketV2.leaveRoom(`user:${userFactory.user._id}`);
        this.SocketV2.unwatchModelChanges('user', userFactory.user);
    }
    _onAuthUpdated(modelObj) {
        console.log("[Socket - User Authenticated Update] we have just updated a logged in trainer with id:" +
            modelObj._id);
        this.Auth.onSocketUpdatedMessage(modelObj);
    }
    _onAuthenticated(modelObj) {
        let userAuthLogoutMessage = `user:auth:logout`,
            chatMessagePreviewUpdateMessage = `chat:message-preview-update`;
        this.SocketV2._socket.removeAllListeners(userAuthLogoutMessage);
        this.SocketV2._socket.on("user:auth:logout", this._onLogout.bind(this));
        this.SocketV2._socket.removeAllListeners(chatMessagePreviewUpdateMessage);
        this.SocketV2._socket.on(chatMessagePreviewUpdateMessage, this._onChatPreviewUpdate.bind(this));
    }
    _onChatPreviewUpdate(message) {
        console.log("[User Socket] chat:message-preview-update message received for message: ",
            message.last_message_text);
        this.Chat.updatePreviewWebsocketMessageReceived(message);
    }
    _onLogout() {
        this.SocketV2._socket.removeAllListeners();
        this.SocketV2.onLogout();
        this.Auth.logoutBySocket();
    }
    logout(user) {
        this.SocketV2._socket.emit('logout', user);
    }
}
angular.module('myApp').service('UserSyncer', UserSyncer);

angular.module('myApp')
    .factory('FullMetalSocket', function(UserSyncer, SocketV2,  CertificationSyncer) {
        //socket_v2.init();
        var FullMetalSocketOverrides = {
            // testConnect : function() {
            // 	if(!socket_v2.socket) {
            // 		socket_v2.init();
            // 	}
            // },
            testDisconnect : function() {

            }
        };
        var FullMetalSocket = angular.extend(
            // { trainer : TrainerSyncer },
            { user : UserSyncer },
            { certification : CertificationSyncer },
            FullMetalSocketOverrides, {}
        );
        return FullMetalSocket;
    });
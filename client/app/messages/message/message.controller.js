var MessageController = (function () {
    function MessageController($mdMedia, $moment, User, Auth, $timeout, Chat, AlertMessage, ChatSocket, SingleChat, $interval, UserFactory, $scope, UserMeta, SocialMeta, $stateParams) {
        this.$mdMedia = $mdMedia;
        this.$moment = $moment;
        this.User = User;
        this.Auth = Auth;
        this.$timeout = $timeout;
        this.Chat = Chat;
        this.AlertMessage = AlertMessage;
        this.ChatSocket = ChatSocket;
        this.SingleChat = SingleChat;
        this.$interval = $interval;
        this.UserFactory = UserFactory;
        this.$scope = $scope;
        this.UserMeta = UserMeta;
        this.SocialMeta = SocialMeta;
        this.$stateParams = $stateParams;
        this.initialLoadStatus = 0;
        this.message = '';
        this.messageId = this.$stateParams.id;
        this._initChat();
        this._initUserFactory();
        this._watchForMessageEvents();
        this._initScopeEvents();
    }
    MessageController.prototype.localComparator = function (item, item2) {
        return new Date(item.formatted_sorting);
    };
    ;
    MessageController.log = function () {
        var optionalParams = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            optionalParams[_i - 0] = arguments[_i];
        }
        var prefix = 'MessageController';
        var oldConsole = console.log;
        Array.prototype.unshift.call(arguments, "[" + prefix + "] ");
        oldConsole.apply(this, arguments);
    };
    ;
    MessageController.prototype._watchContentScrollEvents = function () {
        var _this = this;
        var content = MessageController._getMessageContentElement();
        content.bind('scroll', function () {
            if (content.scrollTop() >= (content[0].scrollHeight - content.height() - 15)) {
                MessageController.log('window is on bottom');
                _this.messageWindowIsOnBottom = true;
            }
            else
                _this.messageWindowIsOnBottom = false;
        });
    };
    MessageController.prototype._initMeta = function () {
        this.SocialMeta.set(this.UserMeta.metaChatWindow(this.userFactory));
    };
    MessageController.prototype._initScopeEvents = function () {
        var _this = this;
        this.$scope.$on('$destroy', this.onDestroy.bind(this));
        this.$scope.$on('$stateChangeStart', function () {
            _this.ChatSocket.leaveChat(_this.messageId);
        });
    };
    MessageController.prototype._initUserFactory = function () {
        var _this = this;
        this.Auth.isLoggedInAsync(function () {
            if (_this.$scope.userFactory) {
                _this.userFactory = _this.$scope.userFactory;
            }
            else {
                _this.userFactory = _this.UserFactory.init(_this.Auth.getCurrentUser());
            }
            _this.pressEnterToSend = _this.userFactory.user.chat_press_enter_to_send;
            _this._initMeta();
        });
    };
    MessageController.prototype.shouldShowLoadMoreBar = function () {
        return this.initialLoadStatus == 1 && !this.chat.complete;
    };
    MessageController.prototype.shouldShowNewMessagesNotification = function () {
        return this.chat.newMessageCount() >= 1;
    };
    MessageController.prototype.getNewMessageText = function () {
        var newMessageCount = this.chat.newMessageCount(), isSingleMessage = (newMessageCount == 1), messageConditional = isSingleMessage ? 'message' : 'messages';
        return newMessageCount + " new " + messageConditional;
    };
    MessageController.prototype._initChat = function () {
        var _this = this;
        MessageController.log("initializing chat for id: " + this.messageId);
        this.Auth.isLoggedInAsync(function () {
            _this.chat = new _this.SingleChat(_this.messageId, _this.Auth.getCurrentUser()._id);
            _this.chat.get().then(function () {
                _this.initialLoadStatus = 1;
                _this.scrollMessageWindowToBottom();
                _this._watchContentScrollEvents();
            }).catch(function () {
                _this.initialLoadStatus = -1;
            });
            _this._initChatSocket();
            MessageController.log("chat initialized to: ", _this.chat);
        });
    };
    MessageController.prototype._initChatSocket = function () {
        this.ChatSocket.joinChat(this.messageId);
    };
    MessageController.prototype._destroyChatSocket = function () {
        this.ChatSocket.leaveChat(this.messageId);
    };
    MessageController.prototype._watchForMessageEvents = function () {
        var _this = this;
        if (this.unbindWatchNewMessage) {
            alert();
            this.unbindWatchNewMessage();
        }
        var newMessageEvent = 'chat:' + this.messageId + ':message';
        var newMessageReadEvent = 'chat:' + this.messageId + ':message-seen';
        MessageController.log("watching chat message event: " + newMessageEvent);
        MessageController.log("watching chat message event: " + newMessageReadEvent);
        this.unbindWatchNewMessage =
            this.$scope.$on(newMessageEvent, function (event, message) {
                MessageController.log('received scope message of ' + newMessageEvent);
                _this.chat.receiveWebsocketMessage(message);
                if (_this.messageWindowIsOnBottom) {
                    _this.scrollMessageWindowToBottom();
                }
            });
        this.unbindWatchMessageRead =
            this.$scope.$on(newMessageReadEvent, function (event, message) {
                MessageController.log('received scope message of ' + newMessageReadEvent);
                _this.chat.receiveWebsocketMessageSeen(message);
            });
    };
    MessageController.prototype.scrollMessageWindowToBottom = function () {
        MessageController.log('scrolling message window to bottom');
        this.$timeout(function () {
            var element = MessageController._getMessageContentElement();
            element.scrollTop(element[0].scrollHeight);
        });
    };
    MessageController.prototype._scrollToMessage = function (messageElement) {
        this.$timeout(function () {
            var container = MessageController._getMessageContentElement();
            container.scrollTop(messageElement.offset().top - messageElement.height() - 30);
        });
    };
    MessageController.prototype.shouldShowSendButton = function () {
        if (this.$mdMedia('gt-xs')) {
            return !this.pressEnterToSend;
        }
        return true;
    };
    MessageController.prototype.shouldShowPressEnterToSend = function () {
        return this.$mdMedia('gt-xs');
    };
    MessageController.prototype.onDestroy = function () {
        MessageController.log("unbinding chat message events for id: " + this.messageId);
        this.unbindWatchNewMessage();
        this.unbindWatchMessageRead();
    };
    MessageController.prototype.get = function () {
        var _this = this;
        if (this.busy)
            return;
        var firstMessage = MessageController._getFirstMessage();
        this.busy = true;
        this.chat.get().then(function () {
            _this.busy = false;
            // scroll to the first message before appending these new rows.
            _this._scrollToMessage(firstMessage);
        }).catch(function (err) {
            _this.AlertMessage.error('Something went wrong while accessing this message');
        });
    };
    MessageController.prototype.getRows = function () {
        if (this.$mdMedia('gt-sm')) {
            return 5;
        }
        if (!this.message.length) {
            return 1;
        }
        return 3;
    };
    MessageController._getFirstMessage = function () {
        return $('.message-row:first');
    };
    MessageController._getMessageContentElement = function () {
        return $('md-content, #message-md-content');
    };
    MessageController.prototype.focusTextArea = function () {
        this.$timeout(function () {
            $("#textArea").focus();
        });
    };
    MessageController.resetTextAreaHeight = function () {
        $("#textArea").css({ height: '30px' });
    };
    MessageController.prototype.flipTheSentSwitch = function () {
        var _this = this;
        this.sent = true;
        this.$timeout(function () {
            _this.sent = false;
        });
    };
    MessageController.prototype.textareaPressedEnter = function (e) {
        if (this.pressEnterToSend && !this.shouldShowSendButton()) {
            e.preventDefault();
            this.sendMessage();
        }
    };
    MessageController.prototype.togglePressEnterToSend = function () {
        var previousValue = this.userFactory.user.chat_press_enter_to_send;
        MessageController.log('updating chat_press_enter_to_send from ' + previousValue + ' to: ' + !previousValue);
        this.userFactory.userEditing.chat_press_enter_to_send = !previousValue;
        this.userFactory.save('chatPressEnterToSend').then(function (response) {
            console.log("response is:", response);
        }).catch(console.error);
    };
    MessageController.prototype.sendMessage = function () {
        var _this = this;
        MessageController.log("sending message " + this.message);
        if (!this.message)
            return;
        this.sending = true;
        var sendObject = {
            id: this.Auth.getCurrentUser()._id,
            toChatId: this.messageId,
            message: this.message
        };
        MessageController.log("sending message object " + sendObject);
        this.User.sendChat(sendObject, function () {
            _this.sending = false;
            _this.message = '';
            if (_this.$mdMedia('xs') || _this.$mdMedia('xxs')) {
                MessageController.resetTextAreaHeight();
            }
            _this.focusTextArea();
            _this.flipTheSentSwitch();
            // this.scrollMessageWindowToBottom();
        }, function (err) {
            _this.sending = false;
            _this.focusTextArea();
            _this.AlertMessage.error('There was a problem sending this message, try again later');
        });
    };
    MessageController.$inject = [
        '$mdMedia',
        '$moment',
        'User',
        'Auth',
        '$timeout',
        'Chat',
        'AlertMessage',
        'ChatSocket',
        'SingleChat',
        '$interval',
        'UserFactory',
        '$scope',
        'UserMeta',
        'SocialMeta',
        '$stateParams'
    ];
    return MessageController;
}());
angular.module('myApp').controller('MessageController', MessageController);
/*
 angular.module('myApp').controller('MessageController', function($mdMedia,
 $moment,
 $scope,
 User,
 Auth,
 SingleChat,
 $timeout,
 Chat,
 AlertMessage,
 FullMetalSocket,
 MessagesMenu,
 $mdSidenav,
 ChatSocket,
 socket_v2,
 $interval,
 TrainerFactory,
 UserFactory,
 $stateParams) {
 var elem; // important

 // Todo clean this controller up, it's dirty as crap, probably the dirtiest one I've got
 $scope.message = {
 text: ''
 };
 var messageElement;

 // $scope.messagesMenuIsLockedOpen = function () {
 // 	// This is insane, the mdsidenav service is empty when this controller is being created, we
 // 	// have to do this hacky check, that's NUTS
 // 	var isLockedOpen = $mdSidenav('messages', true).isLockedOpen
 // 		&& $mdSidenav('messages', true).isLockedOpen();
 // 	if(isLockedOpen) {
 // 		// need to close the side menu so that it doesn't pop back open when we exit this state
 // 		$mdSidenav('messages')
 // 			.close()
 // 	}
 // 	return isLockedOpen;
 // };

 var messageId = $stateParams.id;

 // $scope.readThisChatNotification = function() {
 // 	User.readChatNotifications({
 // 		id : Auth.getCurrentUser()._id,
 // 		chatId : messageId
 // 	}, function(response){},
 // 		function(err){ MessageController.log("readChatNotifications error:", err);});
 // };

 // $scope.getRows = function() {
 //     if($mdMedia('gt-sm')) {
 //         return 5;
 //     }
 //     if(!$scope.message.text || !$scope.message.text.length) {
 //         return 1;
 //     }
 //     return 3;
 // };
 //
 // Auth.isLoggedInAsync(function(){
 //     $scope.readThisChatNotification();
 //     $scope.chat = new SingleChat(messageId, Auth.getCurrentUser()._id);
 // });

 // this is inside an Md dialog, the scope is not being destroyed when it closes.
 // So we can't do a $scope.$on('#destroy') here.  So check this way.
 // This prevents the message from being sent twice to the client message service
 // if($scope.offCallMeFnNewMessage) {
 //     $scope.offCallMeFnNewMessage();
 // }
 // if($scope.offCallMeFnMessageRead) {
 //     $scope.offCallMeFnMessageRead();
 // }
 // $scope.offCallMeFnNewMessage = $scope.$on('chat:' + messageId + ':message', function(event, message){
 //     $scope.chat.receiveWebsocketMessage(message);
 //     if($scope.bottom) {
 //         $scope.scrollMessageWindowToBottom();
 //         $timeout(function(){
 //             $scope.scrollMessageWindowToBottom();
 //         }, 100);
 //     }
 // });
 //
 // $scope.offCallMeFnMessageRead = $scope.$on('chat:' + messageId + ':message-seen', function(event, message){
 //     $scope.chat.receiveWebsocketMessageSeen(message);
 //     if($scope.bottom) {
 //         $scope.scrollMessageWindowToBottom();
 //         $timeout(function(){
 //             $scope.scrollMessageWindowToBottom();
 //         }, 100);
 //     }
 // });

 // $scope.mdMedia = $mdMedia;
 //
 // $scope.textAreaSetFocus = function(bool){
 //     $scope.textAreaFocus = bool;
 // };

 // $scope.localComparator = function(item, item2) {
 //     return new Date(item.formatted_sorting);
 // };

 // $scope.get = function() {
 //     if($scope.localBusy) return;
 //     var firstMsg = $(".message-row:first");
 //     messageElement = $("#message-md-content, #message");
 //     $scope.localBusy = true;
 //     $scope.chat.get().then(function(){
 //         $scope.localBusy = false;
 //         if(firstMsg && firstMsg[0] && messageElement) {
 //             $timeout(function() {
 //                 messageElement.scrollTop(firstMsg.offset().top
 //                     - messageElement.offset().top - 5);
 //             });
 //         }
 //         $scope.ready = true;
 //     }).catch(function(err){
 //         $scope.localBusy = false;
 //     });
 // };

 $scope.scrollMessageWindowToBottom = function() {
 var objDiv = document.getElementById("message-md-content");
 if(!objDiv) return;
 objDiv.scrollTop = objDiv.scrollHeight;
 objDiv = document.getElementById("message");
 if(!objDiv) return;
 objDiv.scrollTop = objDiv.scrollHeight;
 $scope.stopInterval();
 };

 // must be state change start, the way routes are constructed and the mddialog
 $scope.$on('$stateChangeStart', function() {
 ChatSocket.leaveChat(messageId);
 });

 $scope.sendMessageBusy = false;

 $scope.sendMessage = function() {
 // $scope.hasFormBeenSubmitted = true;
 if(!$scope.message || !$scope.message.text) return;
 $scope.sendMessageBusy = true;
 // please don't worry about this being jquery, using a focus-me directive was not working...
 var sendObject = {
 id : Auth.getCurrentUser()._id,
 toChatId : $stateParams.id,
 message : $scope.message.text
 };
 function regainFocus() {
 $("#textArea").focus();
 $timeout(function(){
 $("#textArea").focus();
 }, 1);
 }
 regainFocus();
 User.sendChat(sendObject, function(response){
 $scope.sendMessageBusy = false;
 $scope.message.text = '';
 if($mdMedia('xs') || $mdMedia('xxs')) {
 $("#textArea").css({height : '30px'});
 }
 regainFocus();
 $scope.sent = true;
 $timeout(function(){
 $scope.sent = false;
 });
 // AlertMessage.success('Your message has been sent');
 $scope.scrollMessageWindowToBottom();
 }, function(err){
 $scope.sendMessageBusy = false;
 regainFocus();
 AlertMessage.error('There was a problem sending this message, try again later');
 })
 };

 ChatSocket.joinChat(messageId);

 var interval;
 $scope.stopInterval = function() {
 if(angular.isDefined(interval)) {
 var height = elem.height();
 if(height != $scope.height) {
 $interval.cancel(interval);
 interval = undefined;
 $timeout(function(){
 $scope.scrollMessageWindowToBottom();
 });
 }
 }
 };

 $scope.onEnter = function(e) {
 // use scope.showButton here, we won't send on enter when the user is in MOBILE mode,
 // simply because they may have activated send_on_enter but on a mobile, they'll always use the TAP
 if($scope.pressEnterToSend.bool && !$scope.showButton()) {
 e.preventDefault();
 $scope.sendMessage();
 }
 };

 var currentUserResource;
 $scope.updatePressEnterToSend = function() {
 currentUserResource.userEditing.chat_press_enter_to_send = !$scope.pressEnterToSend.bool;
 currentUserResource.save('chatPressEnterToSend').then(function(response){
 }).catch(console.error);
 };

 Auth.isLoggedInAsync(function(){
 currentUserResource = UserFactory.init(Auth.getCurrentUser());
 $scope.pressEnterToSend = {
 bool : Auth.getCurrentUser().chat_press_enter_to_send
 };

 $scope.showPressEnterToSend = function() {
 return $mdMedia('gt-xs');
 };

 $scope.showButton = function() {
 if($mdMedia('gt-xs')) {
 return !$scope.pressEnterToSend.bool;
 }
 return true;
 };

 $scope.chat.get().then(function(){
 $timeout(function(){
 messageElement = $("#message-md-content, #message");
 var contentArea = $("#message-md-content");
 contentArea.scrollTop(contentArea.height());
 $scope.scrollMessageWindowToBottom();
 $scope.localLoading = false;
 $scope.isScrolled = false;
 messageElement.on('scroll', chk_scroll);

 function chk_scroll(e) {
 elem = $(e.currentTarget);
 if (elem[0].scrollHeight - elem.scrollTop() <= elem.outerHeight() + 3) {
 $scope.bottom = true;
 }
 else {
 $scope.bottom = false;
 $scope.isScrolled = true;
 }
 objDiv = document.getElementById("message-md-content");
 $scope.scrollTop = objDiv.scrollTop;
 $scope.scrollHeight = objDiv.scrollHeight;
 }
 var textarea = angular.element(document.getElementById("textArea"));
 textarea.on('click', function() {
 $scope.height = messageElement.height();
 if ( angular.isDefined(interval) ) return;
 if($scope.bottom) {
 interval = $interval(function(){
 $scope.scrollMessageWindowToBottom();
 }, 100);
 $timeout(function() {
 if(angular.isDefined(interval)) {
 $interval.cancel(interval);
 interval = undefined;
 }
 }, 2000)
 }
 });
 });
 }).catch(function(err){
 $scope.localLoading = false;
 });
 });
 });
 */ 

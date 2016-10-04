interface IMessageControllerMessage {
    text:string
}
class MessageController {
    static $inject = [
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
    public message:string;
    public chat;
    private messageId;
    private unbindWatchNewMessage:Function;
    private unbindWatchMessageRead:Function;
    private messageWindowIsOnBottom:boolean;
    private busy:boolean;
    public sending:boolean;
    public sent:boolean;
    private complete;
    private pressEnterToSend:boolean;
    public initialLoadStatus = 0;
    private userFactory;
    public localComparator(item, item2) {
        return new Date(item.formatted_sorting);
    };
    static log(...optionalParams: any[]) {
        let prefix = 'MessageController';
        let oldConsole = console.log;
        Array.prototype.unshift.call(arguments, `[${prefix}] `);
        oldConsole.apply(this, arguments);
    };
    constructor(private $mdMedia,
                private $moment,
                private User,
                private Auth,
                private $timeout,
                private Chat,
                private AlertMessage,
                private ChatSocket,
                private SingleChat,
                private $interval,
                private UserFactory,
                private $scope,
                private UserMeta,
                private SocialMeta,
                private $stateParams) {
        this.message = '';
        this.messageId = this.$stateParams.id;
        this._initChat();
        this._initUserFactory();
        this._watchForMessageEvents();
        this._initScopeEvents();
    }
    public _watchContentScrollEvents() {
        var content = MessageController._getMessageContentElement();
        content.bind('scroll', () => {
            if(content.scrollTop() >= (content[0].scrollHeight - content.height() - 15)) {
                MessageController.log('window is on bottom');
                this.messageWindowIsOnBottom = true;
            }
            else this.messageWindowIsOnBottom = false;
        });
    }
    private _initMeta() {
        this.SocialMeta.set(this.UserMeta.metaChatWindow(this.userFactory));
    }
    private _initScopeEvents() {
        this.$scope.$on('$destroy', this.onDestroy.bind(this));
        this.$scope.$on('$stateChangeStart', () => {
            this.ChatSocket.leaveChat(this.messageId);
        });
    }
    private _initUserFactory() {
        this.Auth.isLoggedInAsync(() => {
            if(this.$scope.userFactory) {
                this.userFactory = this.$scope.userFactory
            }
            else {
                this.userFactory = this.UserFactory.init(this.Auth.getCurrentUser());
            }
            this.pressEnterToSend = this.userFactory.user.chat_press_enter_to_send;
            this._initMeta();
        })
    }
    shouldShowLoadMoreBar() {
        return this.initialLoadStatus == 1 && !this.chat.complete;
    }
    shouldShowNewMessagesNotification() {
        return this.chat.newMessageCount() >= 1;
    }
    getNewMessageText() {
        let newMessageCount = this.chat.newMessageCount(),
            isSingleMessage = (newMessageCount == 1),
            messageConditional = isSingleMessage ? 'message' : 'messages';
        return `${newMessageCount} new ${messageConditional}`;
    }
    private _initChat() {
        MessageController.log("initializing chat for id: " + this.messageId);
        this.Auth.isLoggedInAsync(() => {
            this.chat = new this.SingleChat(this.messageId, this.Auth.getCurrentUser()._id);
            this.chat.get().then(() => {
                this.initialLoadStatus = 1;
                this.scrollMessageWindowToBottom();
                this._watchContentScrollEvents();
            }).catch(() => {
                this.initialLoadStatus = -1;
            });
            this._initChatSocket();
            MessageController.log("chat initialized to: ", this.chat);
        });
    }
    private _initChatSocket() {
        this.ChatSocket.joinChat(this.messageId);
    }
    private _destroyChatSocket() {
        this.ChatSocket.leaveChat(this.messageId);
    }
    private _watchForMessageEvents() {
        if(this.unbindWatchNewMessage) {
            alert();
            this.unbindWatchNewMessage();
        }
        let newMessageEvent ='chat:' + this.messageId + ':message';
        let newMessageReadEvent = 'chat:' + this.messageId + ':message-seen';
        MessageController.log("watching chat message event: " + newMessageEvent);
        MessageController.log("watching chat message event: " + newMessageReadEvent);
        this.unbindWatchNewMessage =
            this.$scope.$on(newMessageEvent, (event, message) => {
                MessageController.log('received scope message of ' + newMessageEvent);
                this.chat.receiveWebsocketMessage(message);
                if(this.messageWindowIsOnBottom) {
                    this.scrollMessageWindowToBottom();
                }
            });
        this.unbindWatchMessageRead =
            this.$scope.$on(newMessageReadEvent, (event, message) => {
                MessageController.log('received scope message of ' + newMessageReadEvent);
                this.chat.receiveWebsocketMessageSeen(message);
            });
    }
    scrollMessageWindowToBottom() {
        MessageController.log('scrolling message window to bottom');
        this.$timeout(() => {
            let element = MessageController._getMessageContentElement();
            element.scrollTop(element[0].scrollHeight);
        });
    }
    _scrollToMessage(messageElement) {
        this.$timeout(() => {
            let container = MessageController._getMessageContentElement();
            container.scrollTop(messageElement.offset().top - messageElement.height() - 30);
        });
    }
    shouldShowSendButton() {
        if(this.$mdMedia('gt-xs')) {
            return !this.pressEnterToSend;
        }
        return true;
    }
    shouldShowPressEnterToSend() {
        return this.$mdMedia('gt-xs');
    }
    onDestroy() {
        MessageController.log("unbinding chat message events for id: " + this.messageId);
        this.unbindWatchNewMessage();
        this.unbindWatchMessageRead();
    }
    get() {
        if(this.busy) return;
        let firstMessage = MessageController._getFirstMessage();
        this.busy = true;
        this.chat.get().then(() => {
            this.busy = false;
            // scroll to the first message before appending these new rows.
            this._scrollToMessage(firstMessage);
        }).catch((err) => {
            this.AlertMessage.error('Something went wrong while accessing this message');
        });
    }
    getRows() {
        if(this.$mdMedia('gt-sm')) {
            return 5;
        }
        if(!this.message.length) {
            return 1;
        }
        return 3;
    }
    static _getFirstMessage() {
        return $('.message-row:first');
    }
    static _getMessageContentElement() {
        return $('md-content, #message-md-content');
    }
    private focusTextArea() {
        this.$timeout(() => {
            $("#textArea").focus();
        })
    }
    static resetTextAreaHeight() {
        $("#textArea").css({height : '30px'});
    }
    private flipTheSentSwitch() {
        this.sent = true;
        this.$timeout(() => {
            this.sent = false;
        });
    }
    textareaPressedEnter(e) {
        if(this.pressEnterToSend && !this.shouldShowSendButton()) {
            e.preventDefault();
            this.sendMessage();
        }
    }
    togglePressEnterToSend() {
        let previousValue = this.userFactory.user.chat_press_enter_to_send;
        MessageController.log('updating chat_press_enter_to_send from ' + previousValue + ' to: ' + !previousValue);
        this.userFactory.userEditing.chat_press_enter_to_send = !previousValue;
        this.userFactory.save('chatPressEnterToSend').then(function(response){
            console.log("response is:", response);
        }).catch(console.error);
    }
    sendMessage() {
        MessageController.log("sending message " + this.message);
        if(!this.message) return;
        this.sending = true;
        let sendObject = {
            id : this.Auth.getCurrentUser()._id,
            toChatId : this.messageId,
            message: this.message
        };
        MessageController.log("sending message object " + sendObject);
        this.User.sendChat(sendObject, () => {
            this.sending = false;
            this.message = '';
            if(this.$mdMedia('xs') || this.$mdMedia('xxs')) {
                MessageController.resetTextAreaHeight();
            }
            this.focusTextArea();
            this.flipTheSentSwitch();
            // this.scrollMessageWindowToBottom();
        }, (err) => {
            this.sending = false;
            this.focusTextArea();
            this.AlertMessage.error('There was a problem sending this message, try again later');
        })
    }
}
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
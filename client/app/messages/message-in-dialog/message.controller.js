myApp.controller('MessageController', function($mdMedia,
                                               $moment,
                                               $scope,
                                               User,
                                               Auth,
                                               SingleChat,
                                               $timeout,
                                               AlertMessage,
                                               FullMetalSocket,
                                               MessagesMenu,
                                               ChatSocket,
                                               socket_v2,
                                               $stateParams){
	$scope.message = {
		text : ''
	};
	$scope.ready = false;
	$scope.footer.hide = true;
	var messageId = $stateParams.id;

	$scope.readThisChatNotification = function() {
		User.readChatNotifications({
			id : Auth.getCurrentUser()._id,
			chatId : messageId
		}, function(response){
			console.log("readChatNotifications response:", response);
		}, function(err){
			console.log("readChatNotifications error:", err);
		});
	};

	$scope.getRows = function() {
		if($mdMedia('gt-sm')) {
			return 5;
		}
		return 3;
	};
	$scope.readThisChatNotification();

	// initialize chat, send userID so that we can allow sending of messages
	// todo, actually, we shouldn't need that... Let's just send the message to the message _id
	$scope.chat = new SingleChat(messageId, Auth.getCurrentUser()._id);

	$scope.$on('chat:' + messageId + ':message', function(event, message){
		console.log("Scope.on message:", message, ' event:', event);
		$scope.chat.receiveWebsocketMessage(message);
		if(message.sender._id == Auth.getCurrentUser()._id)
			$scope.scrollMessageWindowToBottom();
	});

	$scope.mdMedia = $mdMedia;

	$scope.textAreaSetFocus = function(bool){
		$scope.textAreaFocus = bool;
	};

	$scope.localComparator = function(item, item2) {
		// console.log('item1:' , item, ' item2: ', item2);
		return new Date(item.formatted_sorting);
	};

	$scope.get = function() {
		if($scope.localBusy) return;
		var firstMsg = $(".message-row:first");
		$scope.localBusy = true;
		$scope.chat.get().then(function(){
			$scope.localBusy = false;
			if(firstMsg && firstMsg[0]) {
				$timeout(function() {
					$("#message-md-content").scrollTop(firstMsg.offset().top - $("#message-md-content").offset().top - 20);
				}, 1);
			}
			$scope.ready = true;
		}).catch(function(err){
			$scope.localBusy = false;
		});
	};

	$scope.scrollMessageWindowToBottom = function() {
		$timeout(function(){
			var contentArea = $("#message-md-content"),
				scroll = contentArea[0].scrollHeight;
			contentArea.animate({scrollTop : scroll}, 1);
		});
	}

	$scope.$on('$destroy', function() {
		ChatSocket.leaveChat(messageId);
		// FullMetalSocket.user.unsyncChatRoom($stateParams.id);
	});

	$scope.sendMessageBusy = false;

	$scope.sendMessage = function() {
		if(!$scope.message || !$scope.message.text) return;
		$scope.sendMessageBusy = true;
		// please don't worry about this being jquery, using a focus-me directive was not working...
		var sendObject = {
			id : Auth.getCurrentUser()._id,
			toChatId : $stateParams.id,
			message : $scope.message.text
		};
		// console.log("Sending chat using object: ", sendObject);
		function regainFocus() {
			$timeout(function(){
				$("#textArea").focus();
			}, 1);
		}
		regainFocus();
		$("#textArea").focus();
		User.sendChat(sendObject, function(response){
			$scope.sendMessageBusy = false;
			$scope.message.text = '';
			regainFocus();
			AlertMessage.success('Your message has been sent');
		}, function(err){
			$scope.sendMessageBusy = false;
			regainFocus();
			AlertMessage.error('There was a problem sending this message, try again later');
		})
	};

	ChatSocket.joinChat(messageId);

	Auth.isLoggedInAsync(function(){
		// FullMetalSocket.user.syncChatRoom($stateParams.id);
		$scope.chat.get().then(function(){
			$timeout(function(){
				var contentArea = $("#message-md-content");
				contentArea.scrollTop(contentArea.height());
				$scope.scrollMessageWindowToBottom();
				$scope.localLoading = false;
			});
		}).catch(function(err){
			$scope.localLoading = false;
		});
	});
});
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
                                               $interval,
                                               TrainerFactory,
                                               UserFactory,
                                               $stateParams){
	// Todo clean this controller up, it's dirty as crap, probably the dirtiest one I've got
	$scope.message = {
		text : ''
	};
	var messageElement = $("#message-md-content, #message");

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
			console.log("ROWS IS 5");
			return 5;
		}
		if(!$scope.message.text || !$scope.message.text.length) {
			console.log("ROWS IS 1");
			return 1;
		}
		console.log("ROWS IS 3");
		return 3;
	};

	$scope.readThisChatNotification();

	// initialize chat, send userID so that we can allow sending of messages
	// todo, actually, we shouldn't need that... Let's just send the message to the message _id
	$scope.chat = new SingleChat(messageId, Auth.getCurrentUser()._id);

	// this is inside an Md dialog, the scope is not being destroyed when it closes.
	// So we can't do a $scope.$on('#destroy') here.  So check this way.
	// This prevents the message from being sent twice to the client message service
	if($scope.offCallMeFn) {
		$scope.offCallMeFn();
	}
	$scope.offCallMeFn = $scope.$on('chat:' + messageId + ':message', function(event, message){
		console.log("Scope.on message:", message, ' event:', event);
		$scope.chat.receiveWebsocketMessage(message);
		if(message.sender._id == Auth.getCurrentUser()._id) {
			$scope.scrollMessageWindowToBottom();
			$timeout(function(){
				$scope.scrollMessageWindowToBottom();
			}, 100);
		}
	});

	$scope.mdMedia = $mdMedia;

	$scope.textAreaSetFocus = function(bool){
		$scope.textAreaFocus = bool;
	};

	$scope.localComparator = function(item, item2) {
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
					messageElement.scrollTop(firstMsg.offset().top
						- messageElement.offset().top - 20);
				}, 1);
			}
			$scope.ready = true;
		}).catch(function(err){
			$scope.localBusy = false;
		});
	};

	$scope.scrollMessageWindowToBottom = function() {
		var objDiv = document.getElementById("message-md-content");
		objDiv.scrollTop = objDiv.scrollHeight;
		objDiv = document.getElementById("message");
		objDiv.scrollTop = objDiv.scrollHeight;
		$scope.stopInterval();
	};

	$scope.$on('$destroy', function() {
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
		// console.log("Sending chat using object: ", sendObject);
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
		console.log("E is:", e);
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
			console.log("Response:", response);
		}).catch(console.error);
	};

	Auth.isLoggedInAsync(function(){
		currentUserResource = UserFactory.init(Auth.getCurrentUser());
		$scope.pressEnterToSend = {
			bool : Auth.getCurrentUser().chat_press_enter_to_send
		};

		$scope.showButton = function() {
			// console.log($mdMedia('gt-xs'));
			if($mdMedia('gt-xs')) {
				console.log($scope.pressEnterToSend.bool);
				return !$scope.pressEnterToSend.bool;
			}
			return true;
		};

		$scope.chat.get().then(function(){
			$timeout(function(){
				var contentArea = $("#message-md-content");
				contentArea.scrollTop(contentArea.height());
				$scope.scrollMessageWindowToBottom();
				$scope.localLoading = false;
				$scope.isScrolled = false;
				messageElement.on('scroll', chk_scroll);

				function chk_scroll(e) {
					var elem = $(e.currentTarget);
					if (elem[0].scrollHeight - elem.scrollTop() == elem.outerHeight()) {
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
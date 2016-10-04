myApp.service('Chat', function(Auth, User, $q, $http, $moment, lodash){
	var Chat = {
		chats : [],
		busy : false,
		readNotifications : function() {
			return new $q(function(resolve, reject) {
				console.log('[Chat Service] readNotifications()');
				User.readChatNotifications({
					id : Auth.getCurrentUser()._id
				}, resolve, reject);
			});
		},
		// When a new message comes down the wire, this automatically updates the Chat service
		// So that if the menu is open while sending chats, it updates in real-time
		updatePreviewWebsocketMessageReceived : function(message) {
			var needToCreateNewRow = true;
			for(var i = 0; i < this.chats.length; i++) {
				var chatAtIndex = this.chats[i];
				if(chatAtIndex._id == message._id) {
					needToCreateNewRow = false;
					this.chats[i] = lodash.assign(this.chats[i], message);
				}
			}
			if(needToCreateNewRow) {
				this.chats.push(message);
			}
			this.sort();
		},
		sort : function() {
			 this.chats.sort(function(a, b) {
				 if(a.last_message_sent_at > b.last_message_sent_at) {
					 return -1;
				 }
				 else if(a.last_message_sent_at < b.last_message_sent_at) {
					 return 1;
				 }
				 return 0;
			 })
		},
		clear : function() {
			this.error = false;
			return this.get();
		},
		get : function() {
			return new $q(function(resolve, reject) {
				console.log("[Chat Service] get()");
				if(this.busy) {
					console.log('[Chat Service] chat is busy... returning blank');
					return;
				}
				this.busy = true;
				User.getChats({
					id : Auth.getCurrentUser()._id
				}, function(response){
					this.busy = false;
					this.error = false;
					this.chats = response;
					this.initialLoadSuccess = true;
					resolve(response);
				}.bind(this), function(err){
					this.busy = false;
					this.error = err;
					reject(err);
				}.bind(this));
			}.bind(this))
		}
	};
	return Chat;
});

myApp.factory('SingleChat', function($moment, Auth, User, $q, $http){

	// Returning a constructor so that we can track multiple chats at once.
	// No, it's not really necessary at this point in time, but some time we might want to have two chats being
	// loaded / infinite scrolled / etc etc.
	function SingleChat(id, optionalUserId) {
		var self = this;
		this.id = id;
		this.formatted = {};
		this.infoAPIResponse = false;
		this.dates = [];
		this.complete = false;
		this.nextMaxDate = new Date('2030-01-01');
		this.readyToSend = false;
		this.initialLoadSuccess = false;
		this.initialLoadError = false;
		this.websocketMessages = [];
		this.mostRecentMessageSeenAt = false;
		this.mostRecentMessageSentAt = false;
		if(optionalUserId) {
			$http({
				type: 'GET',
				url: 'api/chats/' + id + '/info/' + optionalUserId
			}).success(function(response){
				self.readyToSend = true;
				self.infoAPIResponse = response;
			}).error(function(err){
				console.log("[Single Chat] err,", err);
			});
		}
	}

	function isMessageSentFromMe(message) {
		var senderId = message.sender && message.sender._id ? message.sender._id : message.sender;
		return Auth.getCurrentUser()._id == senderId;
	}
	SingleChat.prototype = {
		markRead : function() {

		},
		receiveWebsocketMessage : function(message) {
			console.log("[Single Chat] receiveWebsocketMessage() with message:", message.message);
			var self = this;
			if(!this.formatted['Today']) {
				var newDate = {
					formatted_display: 'Today',
					formatted_sorting: new Date()
				};
				this.dates.push(newDate);
				this.formatted[newDate.formatted_display] = [];
			}
			// message.fromWebsocket = true;
			if(!isMessageSentFromMe(message)) {
				message.isNew = true;
				message.sendEventWhenSeen = true;
			}
			this.filterMessageThroughHere(message);
			this.formatted['Today'].push(message);
		},

		receiveWebsocketMessageSeen : function(message) {
			this.setSeenAtBasedOnNewMessage(message);
		},

		newMessageCount : function() {
			var count = 0;
			for(var i = 0; i < this.websocketMessages.length; i++) {
				var message = this.websocketMessages[i];
				if(message.isNew) count++;
			}
			return count;
		},

		sendMessage : function(message) {
			var self = this;
			var sender = Auth.getCurrentUser();
			var sender_formatted = {
				_id : sender._id,
				name : sender._name,
				profile_picture : sender.profile_picture
			};
			var messageToSend = {
				chatId : self.id,
				sender : sender_formatted,
				sent_at : new Date(),
				send_at_time_formatted : new $moment(new Date()).format('h:mma'),
				message : message
			};
		},

		setSeenAtBasedOnNewMessage : function(message) {
			for(var i = 0; i < this.websocketMessages.length; i++) {
				var messageAtIndex = this.websocketMessages[i];
				if(messageAtIndex._id == message._id) {
					messageAtIndex.seen_at = message.seen_at;
					messageAtIndex.sent_at = message.sent_at;
					messageAtIndex.seen_at_time_formatted = message.seen_at_time_formatted;
					message = messageAtIndex;
				}
			}
			if(!isMessageSentFromMe(message)) {
				message.isNotFromMe = true;
			}
			else {
				message.isFromMe = true;
			}
			if(message.isNew && message.isNotFromMe) {
				removeSeenAtFromAllMessages.call(this);
				return;
			}

			var thisIsTheMostRecentMessageSeen = message.seen_at && (!this.mostRecentMessageSeenAt ||
				$moment(new Date(message.seen_at)).isAfter(new Date(this.mostRecentMessageSeenAt)));
			var thisIsTheMostRecentMessageSent = !this.mostRecentMessageSentAt ||
				$moment(new Date(message.sent_at)).isAfter(this.mostRecentMessageSentAt);
			if(thisIsTheMostRecentMessageSent){
				this.mostRecentMessageSentAt = message.sent_at;
			}
			if(thisIsTheMostRecentMessageSeen){
				this.mostRecentMessageSeenAt = message.seen_at;
			}
			if(message.isFromMe && message.seen_at && thisIsTheMostRecentMessageSent) {
				removeSeenAtFromAllMessages.call(this);
				message.showSeenAtUnderneath = true;
			}
			else if(message.isNotFromMe && thisIsTheMostRecentMessageSent) {
				removeSeenAtFromAllMessages.call(this);
			}
			function removeSeenAtFromAllMessages() {
				for(var i = 0; i < this.websocketMessages.length; i++) {
					var messageAtIndex = this.websocketMessages[i];
					messageAtIndex.showSeenAtUnderneath = false;
				}
			}
		},

		filterMessageThroughHere : function(message) {
			this.websocketMessages.push(message);
			this.setSeenAtBasedOnNewMessage(message);
		},

		get: function () {
			var id = this.id;
			return new $q(function (resolve, reject) {
				var self = this;
				if (self.complete) {
					console.log("[Single Chat] chat is complete... resolving blank");
					return resolve();
				}
				if (self.busy) {
					console.log("[Single Chat] chat is busy... resolving blank");
					return resolve();
				}
				self.busy = true;
				$http({
					type: 'GET',
					url: 'api/chats/' + id + '/forUser/' + Auth.getCurrentUser()._id,
					params: {
						nextMaxDate: self.nextMaxDate
					}
				}).success(function (data, status, headers) {
					self.nextMaxDate = headers('X-Next-Max-Date');
					self.APIResponse = data;
					var formatted = self.formatted;
					if (data && data.length) {
						var messagesReceived = 0;
						for (var i = 0; i < data.length; i++) {
							var chat = data[i];
							if (!formatted[chat.date_formatted]) {
								formatted[chat.date_formatted] = [];
								var newDate = {
									formatted_display: chat.date_formatted,
									formatted_sorting: chat.max_date
								};
								self.dates.push(newDate);
							}
							for (var k = 0; k < chat.messages.length; k++) {
								messagesReceived++;
								self.filterMessageThroughHere(chat.messages[k]);
								formatted[chat.date_formatted].unshift(chat.messages[k]);
							}
						}
					}
					else {
						console.log("[Single Chat] --- Chat complete ---");
						self.complete = true;
					}
					if(messagesReceived < 10) {
						self.complete = true;
					}
					self.busy = false;
					self.initialLoadSuccess = true;
					return resolve(data);
				}).error(function (err) {
					self.complete = true;
					self.busy = false;
					if(!self.initialLoadSuccess) {
						self.initialLoadError = true;
					}
					return reject(err);
				});
			}.bind(this))
		}
	};
	return (SingleChat);
});
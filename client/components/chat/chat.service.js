myApp.service('Chat', function(Auth, User, $q, $http, $moment){
	var Chat = {
		chats : [],
		busy : false,
		readNotifications : function() {
			return new $q(function(resolve, reject) {
				console.log('chat read notifications');
				console.log("Current logged in user:", Auth.getCurrentUser()._id);
				User.readChatNotifications({
					id : Auth.getCurrentUser()._id
				}, resolve, reject);
			});
		},
		get : function() {
			return new $q(function(resolve, reject) {
				console.log("Chat get chats");
				if(this.busy) {
					console.log('Chat service busy, returning');
					return;
				}
				this.busy = true;
				User.getChats({
					id : Auth.getCurrentUser()._id
				}, function(response){
					this.busy = false;
					Chat.chats = response;
					resolve(response);
				}.bind(this), function(err){
					this.busy = false;
					reject(err);
				}.bind(this));
			}.bind(this))
		}
	};
	return Chat;
});

myApp.factory('SingleChat', function(Auth, User, $q, $http){

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
		if(optionalUserId) {
			$http({
				type: 'GET',
				url: 'api/chats/' + id + '/info/' + optionalUserId
			}).success(function(response){
				self.readyToSend = true;
				self.infoAPIResponse = response;
			}).error(function(err){
				console.log("EEROR INITTING THIS CHAT!", err);
			});
		}
	}

	SingleChat.prototype = {
		init: function (id) {
		},
		receiveWebsocketMessage : function(message) {
			console.log("receiveWebnsocketMessage:", message);
			var self = this;
			if(!this.formatted['Today']) {
				var newDate = {
					formatted_display: 'Today',
					formatted_sorting: new Date()
				};
				this.dates.push(newDate);
				this.formatted[newDate.formatted_display] = [];
			}
			if(message.sender._id != Auth.getCurrentUser()._id) {
				message.isNew = true;
				message.sendEventWhenSeen = true;
			}
			this.websocketMessages.push(message);
			this.formatted['Today'].push(message);
			console.log("This.formatted is:", this.formatted);
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
			console.log("The message to push through the socket is: ", messageToSend);
		},
		get: function () {
			var id = this.id;
			console.log("chat.get()");
			return new $q(function (resolve, reject) {
				var self = this;
				if (self.complete) {
					console.log("Chat is complete... resolving blank");
					return resolve();
				}
				if (self.busy) {
					console.log("Chat is busy... resolving blank");
					return resolve();
				}
				self.busy = true;
				console.log("Getting chat with current user:", Auth.getCurrentUser());
				$http({
					type: 'GET',
					url: 'api/chats/' + id + '/forUser/' + Auth.getCurrentUser()._id,
					params: {
						nextMaxDate: self.nextMaxDate
					}
				}).success(function (data, status, headers) {
					console.log("Single Chat response data:", data);
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
								// console.log("We read messages as:", chat.messages[k]);
								formatted[chat.date_formatted].unshift(chat.messages[k]);
							}
						}
					}
					else {
						console.log("--- Chat complete ---");
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
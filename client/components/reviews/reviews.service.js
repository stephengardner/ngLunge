myApp.factory('Reviews', function(UserReviewsSocket,
                                  $http,
                                  Auth,
                                  LoginDialog,
                                  $moment,
                                  $mdToast,
                                  $q) {

	var Reviews = function(userId) {
		this.init(userId._id || userId);
	}; 

	Reviews.prototype = {
		init : function(userId) {
			if(!userId) {
				console.error('You must supply a userId to get reviews');
				return;
			}
			this.userId = userId;
			this.nextMaxId = undefined;
			this.busy = false;
			this.itemsPerPage = 1;
			this.page = 1;
			this.complete = false;
			this.initialLoadSuccess = false;
			this.data = [];
			this._ids = [];
			this.createSocket();
			this.get();
		},
		onSpecificReviewUpdated : function(doc) {
			console.log('[Reviews Service] received a message for an updated review for userId: ' + this.userId);
			var found = false,
				hasAnyReviews = this.data.length
			;
			for(var i = 0; i < this.data.length; i++) {
				var reviewAtIndex = this.data[i];
				if(reviewAtIndex._id == doc._id) {
					this.data.splice(i, 1, doc);
					this.checkIsThankedByLoggedInUser(this.data[i]);
					found = true;
					break;
				}
			}
			if(!found && (!hasAnyReviews || $moment(doc.created_at).isAfter(this.data[0].created_at))) {
				console.log("[Reviews Service] found that a new review was submitted, we're adding it to the front");
				this.addToData(doc, true);
			}
		},
		addToData : function(review, opt_addToFront) {
			this.checkIsThankedByLoggedInUser(review);
			if(opt_addToFront)
				this.data.unshift(review);
			else
				this.data.push(review);
			this._ids.push(review._id);
		},

		toggleThanks : function(review, ev) {
			if(review.thanking) return false;
			// put this outside, force ONLY a THANK if someone isnt logged in.  This prevents accidental unthanks
			var thankOrUnthank = 'thank';
			if(review.thankedByLoggedInUser) {
				thankOrUnthank = 'unthank';
			}
			LoginDialog.test({ ev : ev }).then(function(){
				var authId = Auth.getCurrentUser()._id;
				if(authId == review.from._id) {
					return $mdToast.show(
						$mdToast.simple()
							.textContent('You can\'t thank yourself for your own review')
							.position('top right')
							.hideDelay(3000))
				}
				review.thanking = true;
				$http({
					url : 'api/users/' + authId + '/review/' + review._id + '/' + thankOrUnthank,
					method : 'POST'
				}).success(function(response){
					// review.thankedByLoggedInUser = (thankOrUnthank == 'thank');
					this.onSpecificReviewUpdated(response);
					review.thanking = false;
				}.bind(this)).error(function(err){
					review.thanking = false;
				}.bind(this))
			}.bind(this)).catch(function(err){
				// do nothing...
			}.bind(this))
		},

		checkIsThankedByLoggedInUser : function(review) {
			if(!Auth.isLoggedIn()) return false;
			for(var i = 0; i < review.thanked_by.length; i++) {
				var thankedByUserAtIndex = review.thanked_by[i];
				if(thankedByUserAtIndex == Auth.getCurrentUser()._id) {
					review.thankedByLoggedInUser = true;
				}
			}
		},
		createSocket : function() {
			UserReviewsSocket.watchReviewUpdatesForUser(this.userId, this.onSpecificReviewUpdated.bind(this));
		},
		destroySocket : function() {
			console.log('[Reviews Service] calling ' +
				'UserReviewsSocket.unwatchReviewUpdatesForUser(' + this.userId + ')');
			UserReviewsSocket.unwatchReviewUpdatesForUser(this.userId);
		},
		checkIfComplete : function(response, status, headers) {
			if(status == 404)
				this.complete = true;
			if(response && response.length < this.itemsPerPage)
				this.complete = true;
		},
		onSuccess : function(response, status, headers) {
			this.initialLoadSuccess = true;
			this.nextMaxId = headers('X-Next-Max-Id');
			for(var i = 0; i < response.length; i++) {
				this.addToData(response[i]);
			}
			this.checkIfComplete(response, status, headers);
			this.busy = false;
			this.page++;
		},
		onError : function(err, status, headers) {
			this.busy = false;
			this.checkIfComplete(err, status, headers);
		},
		constructHttp : function() {
			return {
				url : 'api/users/' + this.userId + '/reviews',
				params : {
					itemsPerPage : this.itemsPerPage,
					page : this.page,
					_ids : this._ids
				}
			};
		},
		refresh : function() {
			this.nextMaxId = undefined;
			this.data = [];
			this.complete = false;
			this.busy = false;
			this.initialLoadSuccess = false;
			this.get();
		},
		get : function() {
			if(this.complete) {
				console.log('Reviews service has reached the end of its reviews.  Returning.');
				return;
			}
			this.busy = true;
			this.cgBusy = $http(this.constructHttp()).success(this.onSuccess.bind(this)).error(this.onError.bind(this))
		}
	};

	return {
		init: function (userOrUserId) {
			return new Reviews(userOrUserId);
		}
	};
});
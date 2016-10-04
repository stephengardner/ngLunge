'use strict';
var TrainerReviewController = (function () {
    function TrainerReviewController(Auth, FormControl, $http, AlertMessage, $timeout, $window, $mdMedia, SocialMeta, UserMeta, $mdDialog, $q, $scope) {
        var _this = this;
        this.Auth = Auth;
        this.FormControl = FormControl;
        this.$http = $http;
        this.AlertMessage = AlertMessage;
        this.$timeout = $timeout;
        this.$window = $window;
        this.$mdMedia = $mdMedia;
        this.SocialMeta = SocialMeta;
        this.UserMeta = UserMeta;
        this.$mdDialog = $mdDialog;
        this.$q = $q;
        this.$scope = $scope;
        this.starDescriptions = {
            'none': 'Select a rating',
            1: 'Awful, not recommended',
            2: 'Eh, it was okay',
            3: 'Good job',
            4: 'Great, highly recommended',
            5: 'The best!'
        };
        this.$timeout(function () {
            _this._checkIfReviewExists()
                .then(_this._reviewExistenceCheckOnSuccess.bind(_this))
                .catch(_this._reviewExistenceCheckOnError.bind(_this));
        }, 1000);
        this._watchWindowResize();
        this._setMetaTags();
        this.starDescription = this.starDescriptions['none'];
        this.removeMongooseError = this.FormControl.removeMongooseError;
        this.close = this.$mdDialog.hide;
        this.loggedInUserProfilePictureUrl = this.Auth.getCurrentUser().profile_picture.thumbnail.url;
        this.loggedInUserDisplayName = this.Auth.getCurrentUser().name.first;
    }
    TrainerReviewController.prototype.submit = function (form) {
        var _this = this;
        console.log("Submitting review:", this.review);
        this.cgBusy = this.$http({
            method: 'POST',
            url: 'api/users/' + this.Auth.getCurrentUser()._id + "/review",
            data: {
                userId: this.$scope.userFactory.user._id,
                review: this.review
            }
        }).success(function (response) {
            console.log(response);
            _this.submitting = false;
            _this.AlertMessage.success('Review submitted!');
            _this.close();
        }).error(function (err) {
            _this.FormControl.parseValidationErrors(form, err);
            _this.AlertMessage.error('Woops, something went wrong, please try again');
            console.log(err);
            _this.submitting = false;
        });
    };
    TrainerReviewController.prototype.toggleSubmitting = function (form, bool) {
        if (bool && !this.review.rating_overall) {
            return this.FormControl.setError(form, 'rating_overall', 'Please set a star rating');
        }
        this.submitting = bool;
    };
    TrainerReviewController.prototype.toggleRecommended = function (bool) {
        if (this.review.recommended === bool) {
            this.review.recommended = undefined;
        }
        else {
            this.review.recommended = bool;
        }
    };
    TrainerReviewController.prototype.onStarHover = function (stars, starsWhole) {
        var _this = this;
        // force scope apply, dont use scope apply because it can cause some wacky error with the stars directive
        this.$timeout(function () {
            _this.starDescription = _this.starDescriptions[starsWhole];
        });
    };
    TrainerReviewController.prototype.delete = function () {
        this.$http({
            method: "DELETE",
            url: 'api/reviews/' + this.review._id
        }).then(function (response) {
            console.log("delete review response:", response);
        }).catch(function (err) {
            console.log("ERR:", err);
        });
    };
    TrainerReviewController.prototype._setMetaTags = function () {
        this.SocialMeta.set(this.UserMeta.reviewWindow(this.$scope.userFactory));
    };
    TrainerReviewController.prototype._watchWindowResize = function () {
        var _this = this;
        var window = angular.element(this.$window);
        window.on('resize', this._onWindowResive);
        this.$scope.$on('$destroy', function () {
            window.off('resize', _this._onWindowResive);
        });
    };
    TrainerReviewController.prototype._reviewExistenceCheckOnError = function (err) {
        this.AlertMessage.error('Something went wrong while retrieving this chat');
    };
    TrainerReviewController.prototype._onWindowResive = function () {
        var backdrop = angular.element('.md-dialog-container');
        if (this.$mdMedia('xs') || this.$mdMedia('xxs')) {
            backdrop.addClass('layout-fill-important');
        }
        else {
            backdrop.removeClass('layout-fill-important');
        }
    };
    TrainerReviewController.prototype._reviewExistenceCheckOnSuccess = function (response) {
        this.reviewExistenceChecked = true;
        this.reviewExists = !!response;
        if (response)
            this.review = response;
        else
            this._initEmptyReview();
    };
    TrainerReviewController.prototype._initEmptyReview = function () {
        this.review = {
            rating_overall: undefined,
            text_overall: undefined,
            recommended: undefined
        };
    };
    TrainerReviewController.prototype._checkIfReviewExists = function () {
        var _this = this;
        return new this.$q(function (resolve, reject) {
            _this.$http({
                url: 'api/users/' + _this.Auth.getCurrentUser()._id + '/review/' + _this.$scope.userFactory.user._id
            }).success(resolve).error(function (err) {
                _this.AlertMessage.error('Something went wrong, please try again later');
            });
        });
    };
    TrainerReviewController.$inject = [
        'Auth',
        'FormControl',
        '$http',
        'AlertMessage',
        '$timeout',
        '$window',
        '$mdMedia',
        'SocialMeta',
        'UserMeta',
        '$mdDialog',
        '$q',
        '$scope'
    ];
    return TrainerReviewController;
}());
angular.module('myApp').controller('TrainerReviewController', TrainerReviewController);

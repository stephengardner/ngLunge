'use strict';

interface ITrainerReview {
    rating_overall: number,
    text_overall: string,
    recommended: boolean
}

interface ITrainerReviewController {
    starDescriptions;
    reviewExistenceChecked:boolean;
    reviewExists:boolean;
    removeMongooseError:Function;
    close:Function;
    loggedInUserProfilePictureUrl:string;
    loggedInUserDisplayName:string;
    submitting:boolean;
    review:ITrainerReview;
    cgBusy;
    submit:Function;
    toggleSubmitting:Function;
    toggleRecommended:Function;
    onStarHover:Function;
    delete:Function;
}

class TrainerReviewController implements ITrainerReviewController{
    static $inject = [
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
    public starDescriptions = {
        'none' : 'Select a rating',
        1 : 'Awful, not recommended',
        2 : 'Eh, it was okay',
        3 : 'Good job',
        4 : 'Great, highly recommended',
        5 : 'The best!'
    };
    public starDescription;
    public reviewExistenceChecked;
    public reviewExists;
    public removeMongooseError;
    public close;
    public loggedInUserProfilePictureUrl;
    public loggedInUserDisplayName;
    public submitting;
    public review;
    public cgBusy;
    constructor(private Auth,
                private FormControl,
                private $http,
                private AlertMessage,
                private $timeout,
                private $window,
                private $mdMedia,
                private SocialMeta,
                private UserMeta,
                private $mdDialog,
                private $q,
                private $scope) {
        this.$timeout(() => {
            this._checkIfReviewExists()
                .then(this._reviewExistenceCheckOnSuccess.bind(this))
                .catch(this._reviewExistenceCheckOnError.bind(this));
        }, 1000);
        this._watchWindowResize();
        this._setMetaTags();
        this.starDescription = this.starDescriptions['none'];
        this.removeMongooseError = this.FormControl.removeMongooseError;
        this.close = this.$mdDialog.hide;
        this.loggedInUserProfilePictureUrl = this.Auth.getCurrentUser().profile_picture.thumbnail.url;
        this.loggedInUserDisplayName = this.Auth.getCurrentUser().name.first;

    }
    public submit(form) {
        console.log("Submitting review:", this.review);
        this.cgBusy = this.$http({
            method : 'POST',
            url : 'api/users/' + this.Auth.getCurrentUser()._id + "/review",
            data : {
                userId : this.$scope.userFactory.user._id,
                review : this.review
            }
        }).success((response) => {
            console.log(response);
            this.submitting = false;
            this.AlertMessage.success('Review submitted!');
            this.close();
        }).error((err) => {
            this.FormControl.parseValidationErrors(form, err);
            this.AlertMessage.error('Woops, something went wrong, please try again');
            console.log(err);
            this.submitting = false;
        });
    }
    public toggleSubmitting(form, bool) {
        if(bool && !this.review.rating_overall) {
            return this.FormControl.setError(form, 'rating_overall', 'Please set a star rating');
        }
        this.submitting = bool;
    }
    public toggleRecommended(bool) {
        if(this.review.recommended === bool) {
            this.review.recommended = undefined;
        }
        else {
            this.review.recommended = bool;
        }
    }
    public onStarHover(stars, starsWhole) {
        // force scope apply, dont use scope apply because it can cause some wacky error with the stars directive
        this.$timeout(() => {
            this.starDescription = this.starDescriptions[starsWhole];
        });
    }
    public delete() {
        this.$http({
            method : "DELETE",
            url : 'api/reviews/' + this.review._id
        }).then((response) => {
            console.log("delete review response:", response);
        }).catch((err) => {
            console.log("ERR:", err);
        })
    }
    private _setMetaTags() {
        this.SocialMeta.set(this.UserMeta.reviewWindow(this.$scope.userFactory));
    }
    private _watchWindowResize() {
        let window = angular.element(this.$window);
        window.on('resize', this._onWindowResive);
        this.$scope.$on('$destroy', () => {
            window.off('resize', this._onWindowResive);
        });
    }
    private _reviewExistenceCheckOnError(err) {
        this.AlertMessage.error('Something went wrong while retrieving this chat');
    }
    private _onWindowResive() {
        var backdrop = angular.element('.md-dialog-container');
        if(this.$mdMedia('xs') || this.$mdMedia('xxs')){
            backdrop.addClass('layout-fill-important');
        }
        else {
            backdrop.removeClass('layout-fill-important');
        }
    }
    private _reviewExistenceCheckOnSuccess(response) {
        this.reviewExistenceChecked = true;
        this.reviewExists = !!response;
        if(response) this.review = response;
        else this._initEmptyReview()
    }
    private _initEmptyReview() {
        this.review = {
            rating_overall : undefined,
            text_overall : undefined,
            recommended : undefined
        }
    }
    private _checkIfReviewExists() {
        return new this.$q((resolve, reject) => {
            this.$http({
                url : 'api/users/' + this.Auth.getCurrentUser()._id + '/review/' + this.$scope.userFactory.user._id
            }).success(resolve).error((err) => {
                this.AlertMessage.error('Something went wrong, please try again later');
            })
        });
    }
}
angular.module('myApp').controller('TrainerReviewController', TrainerReviewController);
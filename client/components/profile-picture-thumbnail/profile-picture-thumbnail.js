var MyDirectiveController = (function () {
    function MyDirectiveController($scope, UserFactory, lodash) {
        this.$scope = $scope;
        this.UserFactory = UserFactory;
        this.lodash = lodash;
        this.defaultColor = '#aaa';
        this.defaultInitials = '?';
        this.defaultWidth = 45;
        this.defaultHeight = 45;
        var DEFAULTS = {
            showInitials: true,
            link: true,
            height: this.defaultHeight,
            width: this.defaultWidth
        };
        if (this.$scope.width && !this.$scope.height)
            this.$scope.height = this.$scope.width;
        else if (this.$scope.height && !this.$scope.width)
            this.$scope.width = this.$scope.height;
        var params = this.lodash.merge(DEFAULTS, this.$scope);
        this.lodash.merge(this.$scope, params);
        if (this.$scope.height.indexOf &&
            this.$scope.height.indexOf('px') == -1) {
            this.$scope.height += 'px';
        }
        if (this.$scope.width.indexOf &&
            this.$scope.width.indexOf('px') == -1) {
            this.$scope.width += 'px';
        }
    }
    MyDirectiveController.prototype.shouldShowInitials = function () {
        return this.$scope.showInitials && this.hasProfilePicture();
    };
    MyDirectiveController.prototype.getProfileSref = function () {
        var user = this.$scope.user, state, urlName;
        if (!this.$scope.link)
            return;
        if (!user.kind) {
            console.error('kind required on user:', user);
            return;
        }
        if (!user.urlName)
            return;
        if (user.kind == 'trainee') {
            state = 'main.trainee.profilePage';
        }
        else if (user.kind == 'trainer') {
            state = 'profilePage';
        }
        if (!state) {
            console.error('State required');
            return;
        }
        return state + "({urlName : '" + user.urlName + "'})";
    };
    MyDirectiveController.prototype.hasProfilePicture = function () {
        var hasProfilePicture = this.$scope.user &&
            this.$scope.user.profile_picture &&
            this.$scope.user.profile_picture.thumbnail.url &&
            this.$scope.user.profile_picture.thumbnail.url.indexOf('default') == -1;
        return hasProfilePicture;
    };
    MyDirectiveController.prototype.profilePictureUrl = function () {
        return this.$scope.user.profile_picture.thumbnail.url;
    };
    MyDirectiveController.prototype.getColor = function () {
        var returnColor = this.defaultColor;
        if (this.$scope.user.color) {
            return this.$scope.user.color;
        }
        return returnColor;
    };
    MyDirectiveController.prototype.isAnonymous = function () {
        var user = this.$scope.user, hasFirstName = user.name && user.name.first, hasLastName = user.name && user.name.last, isAnonymous = hasFirstName && user.name.first == 'Anonymous' && hasLastName && user.name.last == 'Trainer';
        return isAnonymous;
    };
    MyDirectiveController.prototype.getInitials = function () {
        var returnChar = this.defaultInitials, user = this.$scope.user, hasFirstName = user.name && user.name.first, hasLastName = user.name && user.name.last;
        if (this.isAnonymous())
            return returnChar;
        if (hasFirstName || hasLastName)
            returnChar = '';
        if (hasFirstName) {
            returnChar += this.$scope.user.name.first.charAt(0);
        }
        if (hasLastName) {
            returnChar += this.$scope.user.name.last.charAt(0);
        }
        return returnChar;
    };
    MyDirectiveController.$inject = ['$scope', 'UserFactory', 'lodash'];
    return MyDirectiveController;
}());
function myDirective() {
    return {
        restrict: 'AE',
        templateUrl: 'components/profile-picture-thumbnail/profile-picture-thumbnail.partial.html',
        replace: true,
        controller: MyDirectiveController,
        controllerAs: 'vm',
        scope: {
            user: '=',
            showInitials: '=?',
            link: '=?',
            width: '=?',
            height: '=?'
        },
        link: function (scope, element, attrs, ctrl) {
        }
    };
}
angular.module('myApp').directive('profilePictureThumbnail', myDirective);

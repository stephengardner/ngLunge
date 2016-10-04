
interface IMyDirectiveController {
    // specify exposed controller methods and properties here
    hasProfilePicture(): boolean;
}

class MyDirectiveController implements IMyDirectiveController {
    private defaultColor:string = '#aaa';
    private defaultInitials:string = '?';
    private defaultWidth:any = 45;
    private defaultHeight:any= 45;

    static $inject = ['$scope', 'UserFactory', 'lodash'];
    constructor(private $scope, private UserFactory, private lodash) {
        let DEFAULTS = {
            showInitials : true,
            link : true,
            height : this.defaultHeight,
            width : this.defaultWidth
        };

        if(this.$scope.width && !this.$scope.height) this.$scope.height = this.$scope.width;
        else if(this.$scope.height && !this.$scope.width) this.$scope.width = this.$scope.height;

        let params = this.lodash.merge(DEFAULTS, this.$scope);
        this.lodash.merge(this.$scope, params);

        if(this.$scope.height.indexOf &&
            this.$scope.height.indexOf('px') == -1) {
            this.$scope.height += 'px';
        }
        if(this.$scope.width.indexOf &&
            this.$scope.width.indexOf('px') == -1) {
            this.$scope.width += 'px';
        }
    }

    shouldShowInitials(): boolean {
        return this.$scope.showInitials && this.hasProfilePicture();
    }

    getProfileSref(): string {
        let user = this.$scope.user,
            state,
            urlName
            ;
        if(!this.$scope.link) return;
        if(!user.kind) {
            console.error('kind required on user:', user);
            return;
        }
        if(!user.urlName) return;
        if(user.kind == 'trainee') {
            state = 'main.trainee.profilePage';
        }
        else if(user.kind == 'trainer') {
            state = 'profilePage'
        }
        if(!state) {
            console.error('State required');
            return;
        }
        return state + "({urlName : '" + user.urlName + "'})";
    }

    hasProfilePicture(): boolean {
        let hasProfilePicture = this.$scope.user &&
            this.$scope.user.profile_picture &&
            this.$scope.user.profile_picture.thumbnail.url &&
            this.$scope.user.profile_picture.thumbnail.url.indexOf('default') == -1;
        return hasProfilePicture;
    }

    profilePictureUrl(): string {
        return this.$scope.user.profile_picture.thumbnail.url
    }

    getColor(): string {
        var returnColor = this.defaultColor;
        if(this.$scope.user.color) {
            return this.$scope.user.color;
        }
        return returnColor;
    }

    isAnonymous(): boolean {
        var user = this.$scope.user,
            hasFirstName = user.name && user.name.first,
            hasLastName = user.name && user.name.last,
            isAnonymous = hasFirstName && user.name.first == 'Anonymous' && hasLastName && user.name.last == 'Trainer'
        ;
        return isAnonymous;
    }
    getInitials(): string {
        var returnChar = this.defaultInitials,
            user = this.$scope.user,
            hasFirstName = user.name && user.name.first,
            hasLastName = user.name && user.name.last
        ;
        if(this.isAnonymous()) return returnChar;
        if(hasFirstName || hasLastName) returnChar = '';
        if(hasFirstName) {
            returnChar += this.$scope.user.name.first.charAt(0);
        }
        if(hasLastName) {
            returnChar += this.$scope.user.name.last.charAt(0);
        }
        return returnChar;
    }
}

function myDirective(): ng.IDirective {
    return {
        restrict: 'AE',
        templateUrl: 'components/profile-picture-thumbnail/profile-picture-thumbnail.partial.html',
        replace: true,
        controller: MyDirectiveController,
        controllerAs: 'vm',
        scope : {
            user : '=',
            showInitials : '=?',
            link : '=?',
            width : '=?',
            height : '=?'
        },
        link: (scope, element, attrs, ctrl: IMyDirectiveController) : void => {
        }
    };
}

angular.module('myApp').directive('profilePictureThumbnail', myDirective);

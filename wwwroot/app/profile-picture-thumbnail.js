var MyDirectiveController = (function () {
    function MyDirectiveController($scope, UserFactory, lodash) {
        this.$scope = $scope;
        this.UserFactory = UserFactory;
        this.lodash = lodash;
        this.defaultColor = '#999';
        this.defaultInitials = '?';
        var DEFAULTS = {
            showInitials: true
        };
        var params = this.lodash.merge(this.$scope, DEFAULTS);
        this.lodash.merge(this.$scope, params);
    }
    MyDirectiveController.prototype.shouldShowInitials = function () {
        return this.$scope.showInitials && this.hasProfilePicture();
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
    MyDirectiveController.prototype.getInitials = function () {
        var returnChar = this.defaultInitials;
        if (this.$scope.user.name && this.$scope.user.name.first) {
            returnChar = '';
            returnChar += this.$scope.user.name.first.charAt(0);
        }
        if (this.$scope.user.name && this.$scope.user.name.last) {
            returnChar = '';
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
            showInitials: '=?'
        },
        link: function (scope, element, attrs, ctrl) {
        }
    };
}
angular.module('myApp').directive('profilePictureThumbnail', myDirective);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZmlsZS1waWN0dXJlLXRodW1ibmFpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2NsaWVudC9jb21wb25lbnRzL3Byb2ZpbGUtcGljdHVyZS10aHVtYm5haWwvcHJvZmlsZS1waWN0dXJlLXRodW1ibmFpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFNQTtJQUtJLCtCQUFvQixNQUFNLEVBQVUsV0FBVyxFQUFVLE1BQU07UUFBM0MsV0FBTSxHQUFOLE1BQU0sQ0FBQTtRQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFBO1FBQVUsV0FBTSxHQUFOLE1BQU0sQ0FBQTtRQUp2RCxpQkFBWSxHQUFVLE1BQU0sQ0FBQztRQUM3QixvQkFBZSxHQUFVLEdBQUcsQ0FBQztRQUlqQyxJQUFJLFFBQVEsR0FBRztZQUNYLFlBQVksRUFBRyxJQUFJO1NBQ3RCLENBQUM7UUFFRixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVELGtEQUFrQixHQUFsQjtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUNoRSxDQUFDO0lBRUQsaURBQWlCLEdBQWpCO1FBQ0ksSUFBSSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUk7WUFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZTtZQUNoQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLEdBQUc7WUFDOUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzVFLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztJQUM3QixDQUFDO0lBRUQsaURBQWlCLEdBQWpCO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFBO0lBQ3pELENBQUM7SUFFRCx3Q0FBUSxHQUFSO1FBQ0ksSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztRQUNwQyxFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDbEMsQ0FBQztRQUNELE1BQU0sQ0FBQyxXQUFXLENBQUM7SUFDdkIsQ0FBQztJQUVELDJDQUFXLEdBQVg7UUFDSSxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDO1FBQ3RDLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN0RCxVQUFVLEdBQUcsRUFBRSxDQUFDO1lBQ2hCLFVBQVUsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBQ0QsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3JELFVBQVUsR0FBRyxFQUFFLENBQUM7WUFDaEIsVUFBVSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFDRCxNQUFNLENBQUMsVUFBVSxDQUFDO0lBQ3RCLENBQUM7SUE3Q00sNkJBQU8sR0FBRyxDQUFDLFFBQVEsRUFBRSxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUM7SUE4Q3pELDRCQUFDO0FBQUQsQ0FBQyxBQWxERCxJQWtEQztBQUVEO0lBQ0ksTUFBTSxDQUFDO1FBQ0gsUUFBUSxFQUFFLElBQUk7UUFDZCxXQUFXLEVBQUUsNkVBQTZFO1FBQzFGLE9BQU8sRUFBRSxJQUFJO1FBQ2IsVUFBVSxFQUFFLHFCQUFxQjtRQUNqQyxZQUFZLEVBQUUsSUFBSTtRQUNsQixLQUFLLEVBQUc7WUFDSixJQUFJLEVBQUcsR0FBRztZQUNWLFlBQVksRUFBRyxJQUFJO1NBQ3RCO1FBQ0QsSUFBSSxFQUFFLFVBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBNEI7UUFDMUQsQ0FBQztLQUNKLENBQUM7QUFDTixDQUFDO0FBRUQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMseUJBQXlCLEVBQUUsV0FBVyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmludGVyZmFjZSBJTXlEaXJlY3RpdmVDb250cm9sbGVyIHtcbiAgICAvLyBzcGVjaWZ5IGV4cG9zZWQgY29udHJvbGxlciBtZXRob2RzIGFuZCBwcm9wZXJ0aWVzIGhlcmVcbiAgICBoYXNQcm9maWxlUGljdHVyZSgpOiBib29sZWFuO1xufVxuXG5jbGFzcyBNeURpcmVjdGl2ZUNvbnRyb2xsZXIgaW1wbGVtZW50cyBJTXlEaXJlY3RpdmVDb250cm9sbGVyIHtcbiAgICBwcml2YXRlIGRlZmF1bHRDb2xvcjpzdHJpbmcgPSAnIzk5OSc7XG4gICAgcHJpdmF0ZSBkZWZhdWx0SW5pdGlhbHM6c3RyaW5nID0gJz8nO1xuXG4gICAgc3RhdGljICRpbmplY3QgPSBbJyRzY29wZScsICdVc2VyRmFjdG9yeScsICdsb2Rhc2gnXTtcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICRzY29wZSwgcHJpdmF0ZSBVc2VyRmFjdG9yeSwgcHJpdmF0ZSBsb2Rhc2gpIHtcbiAgICAgICAgbGV0IERFRkFVTFRTID0ge1xuICAgICAgICAgICAgc2hvd0luaXRpYWxzIDogdHJ1ZVxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBwYXJhbXMgPSB0aGlzLmxvZGFzaC5tZXJnZSh0aGlzLiRzY29wZSwgREVGQVVMVFMpO1xuICAgICAgICB0aGlzLmxvZGFzaC5tZXJnZSh0aGlzLiRzY29wZSwgcGFyYW1zKTtcbiAgICB9XG5cbiAgICBzaG91bGRTaG93SW5pdGlhbHMoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLiRzY29wZS5zaG93SW5pdGlhbHMgJiYgdGhpcy5oYXNQcm9maWxlUGljdHVyZSgpO1xuICAgIH1cbiAgICBcbiAgICBoYXNQcm9maWxlUGljdHVyZSgpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IGhhc1Byb2ZpbGVQaWN0dXJlID0gdGhpcy4kc2NvcGUudXNlciAmJlxuICAgICAgICAgICAgdGhpcy4kc2NvcGUudXNlci5wcm9maWxlX3BpY3R1cmUgJiZcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLnVzZXIucHJvZmlsZV9waWN0dXJlLnRodW1ibmFpbC51cmwgJiZcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLnVzZXIucHJvZmlsZV9waWN0dXJlLnRodW1ibmFpbC51cmwuaW5kZXhPZignZGVmYXVsdCcpID09IC0xO1xuICAgICAgICByZXR1cm4gaGFzUHJvZmlsZVBpY3R1cmU7XG4gICAgfVxuXG4gICAgcHJvZmlsZVBpY3R1cmVVcmwoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJHNjb3BlLnVzZXIucHJvZmlsZV9waWN0dXJlLnRodW1ibmFpbC51cmxcbiAgICB9XG5cbiAgICBnZXRDb2xvcigpOiBzdHJpbmcge1xuICAgICAgICB2YXIgcmV0dXJuQ29sb3IgPSB0aGlzLmRlZmF1bHRDb2xvcjtcbiAgICAgICAgaWYodGhpcy4kc2NvcGUudXNlci5jb2xvcikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJHNjb3BlLnVzZXIuY29sb3I7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldHVybkNvbG9yO1xuICAgIH1cblxuICAgIGdldEluaXRpYWxzKCk6IHN0cmluZyB7XG4gICAgICAgIHZhciByZXR1cm5DaGFyID0gdGhpcy5kZWZhdWx0SW5pdGlhbHM7XG4gICAgICAgIGlmKHRoaXMuJHNjb3BlLnVzZXIubmFtZSAmJiB0aGlzLiRzY29wZS51c2VyLm5hbWUuZmlyc3QpIHtcbiAgICAgICAgICAgIHJldHVybkNoYXIgPSAnJztcbiAgICAgICAgICAgIHJldHVybkNoYXIgKz0gdGhpcy4kc2NvcGUudXNlci5uYW1lLmZpcnN0LmNoYXJBdCgwKTtcbiAgICAgICAgfVxuICAgICAgICBpZih0aGlzLiRzY29wZS51c2VyLm5hbWUgJiYgdGhpcy4kc2NvcGUudXNlci5uYW1lLmxhc3QpIHtcbiAgICAgICAgICAgIHJldHVybkNoYXIgPSAnJztcbiAgICAgICAgICAgIHJldHVybkNoYXIgKz0gdGhpcy4kc2NvcGUudXNlci5uYW1lLmxhc3QuY2hhckF0KDApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXR1cm5DaGFyO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gbXlEaXJlY3RpdmUoKTogbmcuSURpcmVjdGl2ZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdBRScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnY29tcG9uZW50cy9wcm9maWxlLXBpY3R1cmUtdGh1bWJuYWlsL3Byb2ZpbGUtcGljdHVyZS10aHVtYm5haWwucGFydGlhbC5odG1sJyxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlcjogTXlEaXJlY3RpdmVDb250cm9sbGVyLFxuICAgICAgICBjb250cm9sbGVyQXM6ICd2bScsXG4gICAgICAgIHNjb3BlIDoge1xuICAgICAgICAgICAgdXNlciA6ICc9JyxcbiAgICAgICAgICAgIHNob3dJbml0aWFscyA6ICc9PydcbiAgICAgICAgfSxcbiAgICAgICAgbGluazogKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybDogSU15RGlyZWN0aXZlQ29udHJvbGxlcikgOiB2b2lkID0+IHtcbiAgICAgICAgfVxuICAgIH07XG59XG5cbmFuZ3VsYXIubW9kdWxlKCdteUFwcCcpLmRpcmVjdGl2ZSgncHJvZmlsZVBpY3R1cmVUaHVtYm5haWwnLCBteURpcmVjdGl2ZSk7XG4iXX0=
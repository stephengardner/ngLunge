var UserMeta = (function () {
    function UserMeta($location) {
        this.$location = $location;
    }
    UserMeta.prototype.url = function (userFactory) {
        return this.$location.absUrl();
    };
    UserMeta.prototype.title = function (userFactory) {
        return userFactory.user.name.full;
    };
    UserMeta.prototype.description = function (userFactory) {
        var user = userFactory.user;
        var description;
        console.log("Getting description with user:", user);
        if (user.bio) {
            description = user.bio;
        }
        else {
            var name = user.name.first, location = user.location.city
                + ", "
                + user.location.state, hasLocation = user.location.city, hasSpecialties = user.specialties && user.specialties.length;
            description = "Get started training with " + name + " today.";
            if (hasLocation) {
                description += " Located in " + location + ".";
            }
            if (hasSpecialties) {
                var length = user.specialties.length, str = " " + name + " specializes in ";
                if (length == 1) {
                    str += user.specialties[0].name;
                }
                if (length == 2) {
                    str += user.specialties[0].name + " and " + user.specialties[1].name;
                }
                if (length > 2) {
                    str += user.specialties[0].name + ", " + user.specialties[1].name + ", and " + (length - 2) + " others";
                }
                description += str + ".";
            }
        }
        return description;
    };
    UserMeta.prototype.reviewWindow = function (userFactory) {
        return {
            title: "Write a review for " + userFactory.user.name.first
        };
    };
    UserMeta.prototype.metaChatWindow = function (userFactory) {
        return {
            title: "Conversation with " + userFactory.user.name.first
        };
    };
    UserMeta.prototype.image = function (userFactory) {
        return userFactory.user.profile_picture.thumbnail.url;
    };
    UserMeta.prototype.generalMeta = function (userFactory) {
        return {
            title: this.title(userFactory),
            description: this.description(userFactory),
            url: this.url(userFactory),
            image: this.image(userFactory)
        };
    };
    UserMeta.prototype.createSocialShareAttributes = function (userFactory, provider) {
        var url = this.url(userFactory), description, text;
        if (provider == 'facebook' || provider == 'linkedin') {
            description = this.description(userFactory);
            text = this.title(userFactory);
        }
        if (provider == 'twitter') {
            text = this.title(userFactory) + ' - ' + this.description(userFactory);
        }
        var toReturn = {
            socialshareUrl: url,
            socialshareText: text,
            socialshareDescription: description
        };
        console.log("[User Meta] createSocialShareAttributes returning " + toReturn);
        return toReturn;
    };
    UserMeta.IID = 'UserMeta';
    UserMeta.$inject = ['$location'];
    return UserMeta;
}());
angular.module('myApp').service('UserMeta', UserMeta);

var _ = require('lodash');
module.exports = function (options, imports, register) {
    var logger = imports.logger.info, loggerType = 'location-setter';
    var LocationSetter = (function () {
        function LocationSetter() {
            this._foundPrimaryLocationInArray = false;
        }
        LocationSetter.prototype.set = function (user) {
            this.user = user;
            // these do different things, theyre necessary
            this._initPrimaryLocationInArray();
            this._check();
            // this._setMainLocationIfNoneExists();
            // this._checkIfPrimaryLocationChangedAndSetIt();
            // this._setNewMainLocationIfCurrentOneExistsButNotInTheArray();
        };
        LocationSetter.prototype._check = function () {
            if (this._foundPrimaryLocationInArray) {
                logger.info({ type: loggerType,
                    msg: 'I did find the PrimaryLocation in the array, it was: ',
                    foundPrimaryLocationInArray: this._foundPrimaryLocationInArray
                });
                if (!this._compareLocations(this.user.location, this._foundPrimaryLocationInArray)) {
                    this.user.location = _.merge({}, this._foundPrimaryLocationInArray);
                }
            }
            if (!this._foundPrimaryLocationInArray) {
                logger.info({ type: loggerType, msg: 'I did not find the PrimaryLocation in the array' });
                if (this._hasLocations()) {
                    var firstLocation = this.user.locations[0].toObject();
                    this.user.locations[0].primary = true;
                    this.user.location = _.merge({}, firstLocation);
                }
                else if (!this._hasLocations()) {
                    logger.info({ type: loggerType, msg: 'I am removing the main location, theres nothing left' });
                    this.user.location = null;
                }
            }
        };
        LocationSetter.prototype._initPrimaryLocationInArray = function () {
            if (!this._hasLocations()) {
                this._foundPrimaryLocationInArray = false;
                logger.info({ type: loggerType, msg: 'we have no locations... returning' });
                return;
            }
            var foundPrimaryLocation;
            console.log("This user locations is:", this.user.locations);
            for (var i = 0; i < this.user.locations.length; i++) {
                var locationAtIndex = this.user.locations[i];
                if (locationAtIndex.primary) {
                    console.log("FOT ");
                    this._foundPrimaryLocationInArray = locationAtIndex.toObject();
                    break;
                }
            }
            if (this._foundPrimaryLocationInArray) {
                console.log("Found it:", this._foundPrimaryLocationInArray);
            }
        };
        LocationSetter.prototype._hasLocations = function () {
            return this.user.locations && this.user.locations.length;
        };
        LocationSetter.prototype._compareLocations = function (a, b) {
            return a.city == b.city &&
                a.state == b.state &&
                a.address_line_1 == b.address_line_1;
        };
        return LocationSetter;
    }());
    register(null, {
        locationSetter: LocationSetter
    });
};

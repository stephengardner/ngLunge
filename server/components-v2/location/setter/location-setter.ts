let _ = require('lodash')
    ;
module.exports = function(options, imports, register) {
    let logger = imports.logger.info,
        loggerType = 'location-setter'
        ;
    class LocationSetter {
        private _foundPrimaryLocationInArray:any = false;
        private user;
        constructor(){

        }
        public set(user) {
            this.user = user;
            // these do different things, theyre necessary
            this._initPrimaryLocationInArray();
            this._check();
            // this._setMainLocationIfNoneExists();
            // this._checkIfPrimaryLocationChangedAndSetIt();
            // this._setNewMainLocationIfCurrentOneExistsButNotInTheArray();
        }
        private _check() {
            if(this._foundPrimaryLocationInArray) {
                logger.info({type : loggerType,
                    msg : 'I did find the PrimaryLocation in the array, it was: ',
                    foundPrimaryLocationInArray : this._foundPrimaryLocationInArray
                });
                if(!this._compareLocations(this.user.location, this._foundPrimaryLocationInArray)) {
                    this.user.location = _.merge({}, this._foundPrimaryLocationInArray);
                }
            }
            if(!this._foundPrimaryLocationInArray) {
                logger.info({type : loggerType, msg : 'I did not find the PrimaryLocation in the array'});
                if(this._hasLocations()) {
                    let firstLocation = this.user.locations[0].toObject();
                    this.user.locations[0].primary = true;
                    this.user.location = _.merge({}, firstLocation);
                }
                else if(!this._hasLocations()) {
                    logger.info({type : loggerType, msg : 'I am removing the main location, theres nothing left'});
                    this.user.location = null;
                }
            }
        }

        private _initPrimaryLocationInArray() {
            if(!this._hasLocations()){
                this._foundPrimaryLocationInArray = false;
                logger.info({type : loggerType, msg : 'we have no locations... returning'});
                return;
            }
            let foundPrimaryLocation;
            console.log("This user locations is:", this.user.locations);
            for(var i = 0; i < this.user.locations.length; i++) {
                let locationAtIndex = this.user.locations[i];
                if(locationAtIndex.primary) {
                    console.log("FOT ");
                    this._foundPrimaryLocationInArray = locationAtIndex.toObject();
                    break;
                }
            }
            if(this._foundPrimaryLocationInArray) {
                console.log("Found it:", this._foundPrimaryLocationInArray);
            }
        }
        private _hasLocations () {
            return this.user.locations && this.user.locations.length;
        }
        private _compareLocations(a, b) {
            return a.city == b.city &&
                a.state == b.state &&
                a.address_line_1 == b.address_line_1
        }
        /*
        _setNewMainLocationIfCurrentOneExistsButNotInTheArray() {
            if(this._hasLocations()) {
                for (var i = 0; i < this.user.locations.length; i++) {
                    let locationAtIndex = this.user.locations[i];
                    if (this._compareLocations(locationAtIndex, this.user.location)) {
                        return;
                    }
                }
            }
            if (this._foundPrimaryLocationInArray) {
                this.user.location = _.merge({}, this._foundPrimaryLocationInArray);
            }
            else if (this._hasLocations()) {//this.user.locations[0]) {
                let location = this.user.locations[0].toObject();
                this.user.location = _.merge({}, location);
            }
            else {
                logger.info({
                    type : loggerType,
                    msg : 'nothing left, deleting the main location'
                });
                this.user.location = null;
            }
        }
        private _checkIfPrimaryLocationChangedAndSetIt() {
            if(!this._foundPrimaryLocationInArray) return;
            let previousPrimaryLocation = this.user.location;
            if(this._compareLocations(previousPrimaryLocation, this._foundPrimaryLocationInArray)) {
                return;
            }
            this.user.location = _.merge({}, this._foundPrimaryLocationInArray);

        }
        private _setMainLocationIfNoneExists() {
            logger.info({
                type : loggerType,
                msg : 'setting main location if no primary exists and if non-primary ones DO exist'
            });
            if(this.user.location.state || !this._hasLocations()) return;
            if(!this._foundPrimaryLocationInArray) {
                logger.info({
                    type : loggerType,
                    msg : 'no primary location was found, setting primary location',
                    newLocation : this.user.locations[0]
                });
                this.user.location = _.merge({}, this.user.locations[0]);
            }
            else {
                logger.info({
                    type : loggerType,
                    msg : 'setting main location since it wasnt set, but a primary location existed in the array',
                    newLocation : this._foundPrimaryLocationInArray
                });
                this.user.location = _.merge({}, this._foundPrimaryLocationInArray);
            }
        }
        */
    }

    register(null, {
        locationSetter : LocationSetter
    })
};
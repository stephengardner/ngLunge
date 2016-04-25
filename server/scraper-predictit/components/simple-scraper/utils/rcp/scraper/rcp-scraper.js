var inherits = require('util').inherits,
	Promise = require('promise'),
	expect = require('chai').expect,
	Xray = require('x-ray'),
	x = Xray(),
	_ = require('lodash'),
	async = require('async'),
	indexTest = 0
	;
module.exports = function setup(options, imports, register) {
	var simpleScraper = imports.simpleScraper;
	var DEFAULT_TRACK_OBJECT = {
		active : undefined
	};
	var DEFAULT_PROPERTY_NAMES = {
		header : 'names',
		value : 'avgs',
		valueName : 'avg'
	};
	var DEFAULT_TRACK_INNER_OBJECT = {
		current : false,
		previous : false,
		changed : false
	}
	DEFAULT_TRACK_OBJECT[DEFAULT_PROPERTY_NAMES.valueName] = DEFAULT_TRACK_INNER_OBJECT;

	function rcpScraper(params) {
		//simpleScraper.call(this, params);
		transformParams.call(this, params).then(function(newParams){
			simpleScraper.call(this, newParams);
		}.bind(this)).catch(function(err){
			throw err;
		});
	}
	inherits(rcpScraper, simpleScraper);
	var rcpPrototype = {
		_processPotentialChanges : function() {
			var self = this;
			return new Promise(function(resolve, reject){
				async.waterfall([
					function processChanged(callback) {
						self._setChanged().then(callback.call(null, null)).catch(callback);
					}
				], function(err, response){
					if(err) return reject(err);
					return resolve(response);
				})
				return resolve();
			}.bind(this));
		},

		_setDirections : function() {
			var self = this;
			return new Promise(function(resolve, reject) {
				var track = self.params.track;
				for(var i = 0; i < track.length; i++) {
					var header = track[i],
						stat = self.stats[header][DEFAULT_PROPERTY_NAMES.valueName],
						direction = 'flat',
						previousValueWasNotEmpty = stat.previous !== false && stat.previous !== undefined,
						currentValueGreaterThanPreviousValue = stat.current > stat.previous,
						currentValueLessThanPreviousValue = stat.current < stat.previous;
					if(previousValueWasNotEmpty) {
						if(currentValueGreaterThanPreviousValue) direction = 'up';
						if(currentValueLessThanPreviousValue) direction = 'down';
					}
					stat.direction = direction;
				}
				return resolve();
			})
		},
		_processPotentialThresholdChanges : function() {
			var changed = this._getHeadersThatChangedThreshold();
			return new Promise(function(resolve, reject){
				async.each(changed, _processThresholdChangedSingle.bind(this), function(err){
					if(err) return reject(err);
					return resolve();
				})
				function _getMessageForOnChangeObject(onChangeObject, header) {
					var message;
					if(_.isFunction(onChangeObject.message)) {
						message = onChangeObject.message.call(this, header);
					}
					else {
						message = onChangeObject.message;
					}
					return message;
				}
				function _processThresholdChangedSingle(item, callback) {
					if(this.params.onThresholdChange
						&& (this.params.onThresholdChange[item] || this.params.onThresholdChange['all'])) {
						var onChangeObject = this.params.onThresholdChange[item],
							message, self = this;
						async.waterfall([
							function checkIfOnChangeAll(callback) {
								var onChangeAll = self.params.onThresholdChange['all'];
								if(onChangeAll && onChangeAll.text) {
									message = _getMessageForOnChangeObject.call(self, onChangeAll, item);

									self._sendText({subject : message}).then(function(response){
										callback();
									}).catch(callback);
								}
								else {
									callback();
								}
							},
							function checkIfOnChange(callback) {
								if(onChangeObject && onChangeObject.text) {
									message = _getMessageForOnChangeObject.call(self, onChangeObject, item);
									self._sendText({subject : message}).then(function(response){
										callback();
									}).catch(callback);
								}
								else {
									callback();
								}
							}
						], function(err, response){
							if(err) return callback(err);
							return callback();
						})
					}
					else {
						callback();
					}
				}
			}.bind(this))
		},
		_getHeadersThatChangedThreshold : function() {
			var returnArray = [];
			for(var key in this.stats) {
				if(this.stats[key][DEFAULT_PROPERTY_NAMES.valueName].threshold
					&& this.stats[key][DEFAULT_PROPERTY_NAMES.valueName].threshold.changed === true) {
					returnArray.push(key);
				}
			}
			return returnArray;
		},
		_setChanged: function() {
			return new Promise(function(resolve, reject) {
				var changed = this._getChanged();
				async.each(changed, _processChangedSingle.bind(this), function(err){
					if(err) return reject(err);
					return resolve();
				})
			}.bind(this));
			function _getMessageForOnChangeObject(onChangeObject, header) {
				var message;
				if(_.isFunction(onChangeObject.message)) {
					message = onChangeObject.message.call(this, header);
				}
				else {
					message = onChangeObject.message;
				}
				return message;
			}
			function _processChangedSingle(item, callback) {
				if(this.params.onChange && (this.params.onChange[item] || this.params.onChange['all'])) {
					var onChangeObject = this.params.onChange[item],
						message, self = this;
					async.waterfall([
						function checkIfOnChangeAll(callback) {
							var onChangeAll = self.params.onChange['all'];
							if(onChangeAll && onChangeAll.text) {
								message = _getMessageForOnChangeObject.call(self, onChangeAll, item);

								self._sendText({subject : message}).then(function(response){
									callback();
								}).catch(callback);
							}
							else {
								callback();
							}
						},
						function checkIfOnChange(callback) {
							if(onChangeObject && onChangeObject.text) {
								message = _getMessageForOnChangeObject.call(self, onChangeObject, item);
								self._sendText({subject : message}).then(function(response){
									callback();
								}).catch(callback);
							}
							else {
								callback();
							}
						}
					], function(err, response){
						if(err) return callback(err);
						return callback();
					})
				}
				else {
					callback();
				}
			}
		},
		_getChanged : function() {
			var returnArray = [];
			for(var key in this.stats) {
				if(this.stats[key][DEFAULT_PROPERTY_NAMES.valueName].changed === true) {
					returnArray.push(key);
				}
			}
			return returnArray;
		}
	};
	rcpScraper.prototype = _.merge(rcpScraper.prototype, rcpPrototype);

	function processTriggers() {
		return new Promise(function(resolve, reject){
			async.each(this.params.track, processTriggersForSingle.bind(this), function(err){
				if(err) return reject(err);
				return resolve();
			})
		}.bind(this))

		function processTriggersForSingle(header, callback) {
			if(this.params.trigger && this.params.trigger[header]) {
				var triggerObject = this.params.trigger[header];
				var statObject = this.stats[header][DEFAULT_PROPERTY_NAMES.valueName];
				if(!statObject.threshold) {
					statObject.threshold = {
						current : false,
						previous : false,
						changed : false
					};
				}
				statObject.threshold.previous = statObject.threshold.current;
				async.each(triggerObject.thresholds, processTriggerObjectThreshold.bind(this, header), function(err){
					if(err) return callback(err);
					return callback();
				})
				setThresholdChanged.call(this, header);
			}
			callback();
		}
		function processTriggerObjectThreshold(header, thresholdObject, callback) {
			var statObject = this.stats[header][DEFAULT_PROPERTY_NAMES.valueName];
			var isInThreshold = isStatObjectWithinThreshold(statObject, thresholdObject);
			if(isInThreshold) {
				statObject.threshold.current = createThresholdString(thresholdObject);
			}
			callback();
		}

		function createThresholdString(thresholdObject) {
			var belowObject = thresholdObject.below,
				aboveObject = thresholdObject.above,
				belowValue = belowObject.value,
				aboveValue = aboveObject.value,
				aboveInclusive = aboveObject.inclusive,
				belowInclusive = belowObject.inclusive;
			var belowString = '', aboveString = '';
			if(belowObject) {
				belowString = belowValue;
				belowInclusive ? belowString = '<=' + belowString  : belowString = '<' + belowString;
			}
			if(aboveObject) {
				aboveString = aboveValue;
				aboveInclusive ? aboveString = '>=' + aboveString : aboveString = '>' + aboveString;
			}
			return (aboveString + ' ' + belowString).trim();
		}

		function isInThreshold(statObject, thresholdObject) {
			var current = statObject.current,
				previous = statObject.previous
				;
			if(isNumberInThreshold(current, thresholdObject)
				&& !isNumberInThreshold(previous, thresholdObject)) {
				return true;
			}
		}

		function isNumberInThreshold(number, thresholdObject) {
			var belowObject = thresholdObject.below,
				aboveObject = thresholdObject.above,
				belowValue,
				belowInclusive,
				aboveValue,
				aboveInclusive,
				below,
				above;
			if(belowObject) {
				belowValue = belowObject.value;
				belowInclusive = belowObject.inclusive;
			}
			if(aboveObject) {
				aboveValue = aboveObject.value;
				aboveInclusive = aboveObject.inclusive;
			}
			below = false;
			above = false;
			if(!belowObject) {
				below = true;
			}
			if(!aboveObject) {
				above = true;
			}
			if(belowInclusive && number <= belowValue
				|| (!belowInclusive && number < belowValue)) {
				below = true;
			}
			if(aboveInclusive && number >= aboveValue
				|| (!aboveInclusive && number > aboveValue)) {
				above = true;
			}
			if(above && below) {
				return true;
			}
		}

		function isStatObjectWithinThreshold(statObject, thresholdObject) {
			return isNumberInThreshold(statObject.current, thresholdObject);
		}
	}
	function transformParams(params) {
		var self = this;
		return new Promise(function(resolve, reject){
			expect(params).to.have.property('track');
			expect(params.track).to.be.an.array;
			var track = params.track;
			var xRayFindObject = {};
			xRayFindObject[DEFAULT_PROPERTY_NAMES.header] = x('#polling-data-rcp tr.header', ['th']);
			xRayFindObject[DEFAULT_PROPERTY_NAMES.value] = x('#polling-data-rcp tr.rcpAvg', ['td']);
			var newParams = {
				find: xRayFindObject,
				init : function() {
					var i, trackHeader;
					for(i = 0; i < track.length; i++) {
						trackHeader = track[i];
						initiateTrackObject.call(self, trackHeader);
					}
				},
				preValidate : function(data) {
					var changed = false,
						header,
						i,
						diff;
					if(data	&& data[DEFAULT_PROPERTY_NAMES.header] && data[DEFAULT_PROPERTY_NAMES.header].length) {
						trimAllInArray(data[DEFAULT_PROPERTY_NAMES.header]);
						//indexTest++;
						for(i = 0; i < track.length; i++) {
							header = track[i];
							var indexOfName = data[DEFAULT_PROPERTY_NAMES.header].indexOf(header);
							var dataNamesArrayHasName = indexOfName != -1;
							var current = data[DEFAULT_PROPERTY_NAMES.value][indexOfName];
							//if(indexTest == 2) {
							//	current = 49;
							//}
							//if(indexTest == 3) {
							//	current = 50;
							//}
							if(dataNamesArrayHasName) {
								setCurrentValueForHeader.call(self, header, current);
							}
							else {
								setHeaderInactive.call(self, header);
							}
							evaluateIfAvgHasChanged.call(self, header, current);
						}
						self._setDirections();
						self._processPotentialChanges();
						processTriggers.call(self);
						self._processPotentialThresholdChanges();
					}
					return changed;
				}
			};
			return resolve(_.merge(params, newParams));
		})
	}

	function setHeaderInactive(header) {
		var self = this;
		self.stats[name].active = false;
		self.stats[name][DEFAULT_PROPERTY_NAMES.valueName].current = undefined;
	}

	function setCurrentValueForHeader(header, value) {
		var self = this;
		var trackObject = self.stats[header][DEFAULT_PROPERTY_NAMES.valueName];
		self.stats[header].active = true;
		trackObject.previous = trackObject.current;
		trackObject.current = value;
	}

	function trimAllInArray(arr) {
		for(var i = 0; i < arr.length; i++) {
			arr[i] = arr[i].trim();
		}
	}

	function initiateTrackObject(name) {
		if(!this.stats) this.stats = {};
		if(!this.stats[name]) {
			this.stats[name] = _.merge({}, DEFAULT_TRACK_OBJECT);
		}
	}

	function setThresholdChanged(header) {
		var statObject = this.stats[header][DEFAULT_PROPERTY_NAMES.valueName];
		var thresholdObject = statObject.threshold;
		if(thresholdObject.current !== false
			&& thresholdObject.current !== undefined
			&& thresholdObject.previous !== false
			&& thresholdObject.previous !== undefined
			&& thresholdObject.previous != thresholdObject.current) {
			thresholdObject.changed = true;
		}
		else {
			thresholdObject.changed = false;
		}
	}

	function evaluateIfAvgHasChanged(header, current) {
		if(isNewValueDifferentThanPreviousValue.call(this, header, current)) {
			setHasChanged.call(this, header, true);
		}
		else {
			setHasChanged.call(this, header, false);
		}
	}

	function isNewValueDifferentThanPreviousValue(header, current) {
		var self = this;
		var trackObject = self.stats[header][DEFAULT_PROPERTY_NAMES.valueName];

		return self.stats[header] && trackObject
			&& trackObject.previous !== false
			&& trackObject.previous != current;
	}

	function setHasChanged(name, bool) {
		var self = this;
		self.stats[name].avg.changed = bool;
	}

	register(null, {
		rcpScraper : rcpScraper
	})
}
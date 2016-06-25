var logger = require("../../../components/logger")(),
	osmosis = require("osmosis"),
	config = require('../../../config/environment'),
	mandrill = require('node-mandrill')(config.mandrill.API_KEY),
	expect = require('chai').expect,
	_ = require('lodash'),
	async = require('async'),
	twilio = require('twilio'),
	client = new twilio.RestClient('TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN'),
	Xray = require('x-ray'),
	phantom = require('x-ray-phantom'),
	x = Xray(),//.driver(phantom({webSecurity : false})),
	EventEmitter = require('events').EventEmitter,
	inherits = require('util').inherits
	;
module.exports = function setup(options, imports, register) {
	var email = 'opensourceaugie@gmail.com',
		phoneNumber = '3017047437',
		template = 'trainer-inquiry-v1-1',
		MANDRILL_DEFAULTS = {
			template_name : template,
			template_content : [],
			message : {
				to : [{email : email}],
				merge_language : "handlebars",
				inline_css : true,
				subject : '',
				global_merge_vars : [
					{
						name : 'trainer',
						content : ''
					},
					{
						name : 'inquiry',
						content : ''
					}
				]
			}
		},
		errorSubject = "SOMETHING WENT REALLY WRONG";

	function SimpleScraper(params) {
		//if (!(this instanceof SimpleScraper)) {
		//	return new SimpleScraper(params);
		//}
		//EventEmitter.call(this);
		var DEFAULTS = {
			url : false,
			find : false,
			tripConditions : [],
			moduleName : 'no module name set'
		};
		this.osmosis = osmosis;
		this.x = x;
		// apply phantomjs to xray if specified
		if(params.phantom) {
			this.x.driver(phantom({webSecurity : false}));
		}
		if(params.init) {
			params.init();
		}
		this.params = params;
	}

	var prototype = {
		init : function(params) {

		},
		active : true,
		_conditionToPing : function() {
			return this._isActive && !this._isBusy();
		},
		_isActive : function() {
			return this.active;
		},
		_isBusy : function() {
			return this.busy;
		},
		_checkIfTripped : function(simpleScraperThis, data, condition, callback) {
			if(condition.active) {
				var conditionCheck;
				if(simpleScraperThis.params.type == 'old'){
					conditionCheck = condition.check(data);
				}
				else {
					conditionCheck = condition.check.call(simpleScraperThis, data);
				}
				if(conditionCheck) {
					if(simpleScraperThis.params.type == 'old'){
						condition.isMet(data);
					}
					else {
						condition.isMet(simpleScraperThis, data);
						//condition.isMet.call(simpleScraperThis, data);
					}
					if(condition.trip) {
						simpleScraperThis._disable();
					}
					async.waterfall([
						function checkText(innerCallback) {
							if(condition.text) {
								simpleScraperThis._sendText({subject : condition.text.message}).then(function(response){
									innerCallback(null, response);
								}).catch(innerCallback);
							}
							else {
								innerCallback(null)
							}
						},
						function checkEmail(innerCallback) {
							if(condition.email) {
								simpleScraperThis._sendEmail({subject : condition.subject}).then(function(response){
									innerCallback(null, response);
								}).catch(innerCallback);
							}
							else {
								innerCallback(null);
							}
						}
					], function(err, response){
						if(err) return callback(err);
						return callback(true);
					})
				}
				else {
					callback(null);
				}
			}
		},
		scrape : function() {
			return new Promise(function(resolve, reject){
				if(this._isBusy()){
					return this._onBusy().then(reject).catch(reject);
				}
				if(this._conditionToPing()) {
					console.log("Scraping...", this.params.url);
					this.busy = true;
					// Emitters currently not used, but will be caught if we want to catch this event
					this.emit('scrape-start');
					this.x(this.params.url,	this.params.find)(function(err, data) {
						if(err) {
							console.log("XRAY ERROR(Setting busy to false): ", err);
							this.busy = false;
							return reject(err);
						};
						// prevalidate shouldn't be called prevalidate, it basically sets all values before conditions
						// are checked
						if(this.params.preValidate) {
							if(this.params.type == 'old') {
								this.params.preValidate(data);
							}
							else {
								this.params.preValidate.call(this, data);
							}
						}
						async.each(this.params.conditions, this._checkIfTripped.bind(null, this, data), function(innerErr) {
							if(err) this._onError(innerErr).then(reject).catch(reject);
							this._onSuccess(data).then(resolve).catch(reject);
						}.bind(this));
						if(this.params.postScrape) {
							if(this.params.type == 'old') {
								this.params.postScrape(data);
							}
							else {
								this.params.postScrape.call(this);
							}
						}
					}.bind(this));
				}
				else {
					return this._onTripped(reject);
				}
			}.bind(this))
		},
		_postProcess : function() {
			return new Promise(function(resolve, reject){
				return resolve();
			});
		},
		_onBusy : function() {
			return new Promise(function(resolve, reject){
				return resolve(new Error('scraper is busy, please wait'));
			}.bind(this))
		},
		_onSuccess : function(data) {
			return new Promise(function(resolve, reject){
				this.busy = false;
				resolve(data);
			}.bind(this))
		},
		_onTripped : function(reject) {
			console.log(this.params.moduleName + " tripped.  Reactivate manually");
			reject(false);
		},
		_onError : function(err, reject) {
			console.log("err:",err);
			return new Promise(function(resolve, reject){
				this.busy = false;
				resolve(err);
			}.bind(this))
		},
		_disable : function(){
			this.active = false;
		},
		_enable : function() {
			this.active = true;
		},
		_sendText : function(options) {
			var self = this;
			return new Promise(function(resolve, reject){
				var client = new twilio.RestClient(config.twilio.notifier.sid, config.twilio.notifier.token);
				client.sms.messages.create({
					to : phoneNumber,
					from : '571-393-6500',
					body : options.subject
				}, function(err, message) {
					if(err) return reject(err);
					return resolve(message);
				});
			})
		},
		_sendEmail : function(options) {
			var self = this;
			return new Promise(function(resolve, reject){
				expect(options).to.have.property('subject');
				var params = _.merge({}, MANDRILL_DEFAULTS, { message : options });
				mandrill('messages/send-template', params, function(error, response){
					console.log('Mandrill Send Response: ', response);
					if(error) return reject(error);
					return resolve(response);
				});
			})
		}
	};
	SimpleScraper.prototype = _.merge({}, require('events').EventEmitter.prototype, prototype);

	register(null, {
		simpleScraper : SimpleScraper
	})
};
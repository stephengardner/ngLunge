var async = require("async");
var logger = require("../../../components/logger")();
var config = require('../../../config/environment'),
	mandrill = require('node-mandrill')(config.mandrill.API_KEY),
	expect = require('chai').expect,
	_ = require('lodash'),
	async = require('async')
	;

module.exports = function setup(options, imports, register) {
	// REQUIRED
	var email = 'opensourceaugie@gmail.com',
		moduleName = 'Bush National Poll',
		template = 'trainer-inquiry-v1-1',
		url = 'http://www.realclearpolitics.com/epolls/2016/president/us/2016_republican_presidential_nomination-3823.html'
		;

	var find = {
		name : '#polling-data-rcp table.data tr.header th:nth-of-type(9)',
		avg : '#polling-data-rcp .rcpAvg td:nth-of-type(9)'
	};

	var subjects = {
		dropped : 'BUSH DROPPED!',
		lessThanFivePercent : 'BUSH IS LESS THAN FIVE PERCENT!',
		error : 'SOMETHING WENT REALLY WRONG!'
	};

	var tripConditions = [
		{
			description : 'Bush was removed from RCP',
			subject : subjects.dropped,
			isTripped : function(data) {
				return data && data.name != 'Bush';
			}
		},
		{
			description : 'Bush is less than five percent',
			subject : subjects.lessThanFivePercent,
			isTripped : function(data) {
				return data && data.avg < 5;
			}
		}
	];
	var checkIfTripped = function(data, tripCondition, callback) {
		if(tripCondition.isTripped(data)) {
			scraper.send({subject : tripCondition.subject}).then(function(response){
				callback(null, response);
			}).catch(callback);
		}
		else {
			callback(null);
		}
	}
	var conditionToPing = function() {
		return scraper.active;
	}
	var disable = function() {
		scraper.active = false;
	}
	var enable = function() {
		scraper.active = true;
	};

	var MANDRILL_DEFAULTS = {
		template_name : template,
		template_content : [],
		message : {
			to : [{email : email}],
			merge_language : "handlebars",
			inline_css : true,
			subject : options.subject || 'none',
			global_merge_vars : [
				{
					name : 'trainer',
					content : url
				},
				{
					name : 'inquiry',
					content : url
				}
			]
		}
	};
	var scraper = {
		// active : true,
		// scrape : function(){
		// 	return new Promise(function(resolve, reject){
		// 		if(conditionToPing()) {
		// 			osmosis
		// 				.get(url)
		// 				.set(find)
		// 				.data(function(data){
		// 					console.log("Data : ", data);
		// 					async.each(tripConditions, checkIfTripped.bind(null, data), function(err) {
		// 						if(err)	return scraper.send({subject : subjects.error}).then(resolve).catch(reject);
		// 						return resolve(null);
		// 					})
		// 				}).error(function(err){
		// 					scraper._onError(err, reject);
		// 				})
		// 		}
		// 		else {
		// 			scraper._onTripped(reject);
		// 		}
		// 	})
		// },
		// _onTripped : function(reject) {
		// 	console.log(moduleName + " tripped.  Reactivate manually");
		// 	reject(false);
		// },
		// _onError : function(err, reject) {
		// 	console.log("err:",err);
		// 	reject(false);
		// },
		// send : function(options) {
		// 	return new Promise(function(resolve, reject){
		// 		disable();
		// 		expect(options).to.have.property('subject');
		// 		var params = _.merge({}, MANDRILL_DEFAULTS, options);
		// 		mandrill('messages/send-template', params, function(error, response){
		// 			console.log('Mandrill Send Response: ', response);
		// 			if(error) return reject(error);
		// 			return resolve(response);
		// 		});
		// 	})
		// }
	};
	register(null, {
		bush : scraper
	})
}
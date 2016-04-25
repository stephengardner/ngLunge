// make sure there is a NODE_ENV var

var _ = require("lodash");
if(process.env.NODE_ENV == "foreman" || !process.env.NODE_ENV) {
	_.merge(process.env, require("../config/local.env.js"));
	process.env.NODE_ENV = "development";
	console.log("OK");
}
var CronJob = require('cron').CronJob;
var logger = require('../components/logger')();
var cpus = require('os').cpus().length;
var http = require('http');
var throng = require('throng');
var config = require('../config/environment');
//var app = require('./app/index.js'); // I don't know why but this is requiring the full pathname to index.js
var web = require('../web-server');

//require('longjohn');
var phantom = require('x-ray-phantom');
var Xray = require('x-ray');
var x = Xray().driver(phantom({webSecurity : false}));

//x('https://www.washingtonpost.com/2016-election-results/minnesota/',
//	x('.wpe-card.wpe-card_state', [
//		{
//			party : '.wpe-card_headline',
//			reporting : '.wpe-card_reporting',
//			candidates : x('.wpe-table_row', [
//				{
//					name : x('.wpe-table_cell_candidate'),
//					percent : x('.wpe-table_cell_votes')
//				}
//			])
//		}
//	]))(function(err, str) {
//	console.log("Err:", err);
//	logger.info("data:", str);
//})

//x('http://google.com', 'title')(function(err, str) {
//	console.log("ERR:", err);
//	console.log("Str:", str);
//	//if (err) return done(err);
//	//assert.equal('Google', str);
//	//done();
//})
//http.globalAgent.maxSockets = Infinity;
//
//// spin up our workers...? ok
throng(start, { workers: config.max_concurrency ? config.max_concurrency : 1 });

//var instance;


function start() {
	config.handleQueues = false;
	config.handleServer = false;
	var architect = require("architect");
	var tree = require("../app_v2/architect/scraper-predictit")(config);
	architect.createApp(tree, function(err, Architect){
		if(err) { logger.error(err) }
		else { onCreateApp(Architect)}
	})

	function onCreateApp(Architect) {
		logger.info("App created!");
		var simpleScraper = Architect.getService('simpleScraper');
		var rcpScraper = Architect.getService('rcpScraper');
		var republicanNames = ['Trump', 'Cruz', 'Rubio', 'Kasich', 'Carson', 'Bush'];
		var democraticNames = ['Clinton', 'Sanders'];

		function getCurrentPercentage(name) {
			var stats = this.stats;
			return stats[name].avg.current;
		}

		function getHasChanged(name) {
			var stats = this.stats;
			return stats[name].avg.changed;
		}

		function getHasPassedThreshold(name) {
			var stats = this.stats;
			return stats[name].avg.changedThreshold;
		}

		function getInactive(name) {
			var stats = this.stats;
			return stats[name].active == false;
		}

		function setAvgForName(name, avg) {
			var self = this;
			self.stats[name].active = true;
			self.stats[name].avg.previous = self.stats[name].avg.current;
			self.stats[name].avg.current = avg;
		}

		function evaluateIfAvgHasChanged(name, currentAvg) {
			if(isNewValueDifferentThanPreviousValue.call(this, name, currentAvg)) {
				setHasChanged.call(this, name, true);
			}
			else {
				setHasChanged.call(this, name, false);
			}
		}

		function evaluateIfAvgChangedThresholds(threshold, name) {
			console.log("Thres:", threshold);
			if(!this.stats || !this.stats[name] || !this.stats[name].avg) return new Error('No stats under name : ' + name);
			var self = this, avg = self.stats[name].avg;
			avg.changedThreshold = false;
			//if(!avg.changed) return false;
			if(threshold){
				if(threshold.length) {
					for(var i = 0; i < threshold.length; i++) {
						evaluateSingleThreshold(threshold[i]);
					}
				}
				else {
					evaluateSingleThreshold(threshold);
				}
			}
			function evaluateSingleThreshold(thresh) {
				//console.log("Evaluating threshold: " + parseFloat(thresh) + " compared to current: " + parseFloat(avg.current) + " and previous: " + parseFloat(avg.previous) + " and direction : ", avg.direction);
				if(parseFloat(avg.current) >= parseFloat(thresh)
					&& parseFloat(avg.previous) < parseFloat(thresh)
					&& avg.direction == 'up') {
					console.log("!!!!!!!!!!OMG CHANGED THRESH UP!!!!!!!!!!!!!!");
					avg.changedThreshold = true;
				}
				else if(parseFloat(avg.current) < parseFloat(thresh)
					&& parseFloat(avg.previous) >= parseFloat(thresh)
					&& avg.direction == 'down') {
					console.log("!!!!!!!!!!OMG CHANGED THRESH DOWN!!!!!!!!!!!!!!");
					avg.changedThreshold = true;
				}
			}
		}

		function evaluateDirection(name, current) {
			var self = this, up = false, down = false, direction;
			var isCurrentGreaterThanPrevious
			if(isCurrentValueGreaterThanPreviousValue.call(this, name, current)) {
				up = true;
			}
			if(isCurrentValueLessThanPreviousValue.call(this, name, current)) {
				down = true;
			}
			direction = up ? 'up' : ( down ? 'down' : 'flat' );
			self.stats[name].avg.direction = direction;

		}

		function setInactive(name) {
			var self = this;
			self.stats[name].active = false;
			self.stats[name].avg.current = undefined;
		}

		function setHasChanged(name, bool) {
			var self = this;
			self.stats[name].avg.changed = bool;
		}

		function isCurrentValueGreaterThanPreviousValue(name, current) {
			var self = this;
			return self.stats[name] && self.stats[name].avg
				&& self.stats[name].avg.previous !== false
				&& self.stats[name].avg.previous < current;
		}

		function isCurrentValueLessThanPreviousValue(name, current) {
			var self = this;
			return self.stats[name] && self.stats[name].avg
				&& self.stats[name].avg.previous !== false
				&& self.stats[name].avg.previous > current;
		}

		function isNewValueDifferentThanPreviousValue(name, current) {
			var self = this;
			return self.stats[name] && self.stats[name].avg
				&& self.stats[name].avg.previous !== false
				&& self.stats[name].avg.previous != current;
		}

		function initiateName(name) {
			if(!this.stats) this.stats = {};
			if(!this.stats[name]) {
				this.stats[name] = {
					active : undefined,
					avg: {
						current: false,
						previous: false,
						changed : false
					}
				}
			}
		}
		function trimAllInArray(arr) {
			for(var i = 0; i < arr.length; i++) {
				arr[i] = arr[i].trim();
			}
		}

		function getChanged() {
			var changedArray = [];
			if(this.stats) {
				for(var key in this.stats) {
					var changed = this.stats[key].avg.changed;
					if(changed) {
						changedArray.push(key);
					}
				}
			}
			return changedArray;
		}

		function createChangedMessage() {
			var changed = getChanged.call(this),
				message = '';
			for(var i = 0; i < changed.length; i++) {
				if(this.stats && this.stats[changed[i]] && this.stats[changed[i]].avg) {
					var current = this.stats[changed[i]].avg.current;
					var previous = this.stats[changed[i]].avg.previous;
					message += changed[i] + " changed from " + previous + " to " + current + " \n";
				}
			}
			return message;
		}
		var testIndex = 0;
		var republicanScraper = {
			find : {
				names : x('#polling-data-rcp tr.header', ['th']),
				avgs : x('#polling-data-rcp tr.rcpAvg', ['td'])
			},
			type : 'old',
			stats : {},
			url : 'http://www.realclearpolitics.com/epolls/2016/president/us/' +
			'2016_republican_presidential_nomination-3823.html',
			moduleName : 'Check all republican candidates',
			init : function() {
				var self = this, i, name;
				for(i = 0; i < republicanNames.length; i++) {
					name = republicanNames[i];
					initiateName.call(this, name);
				}
			},
			preValidate : function(data) {
				var changed = false,
					self = this,
					name,
					i,
					diff;
				if(data && data.names && data.names.length) {
					trimAllInArray(data.names);
					for(i = 0; i < republicanNames.length; i++) {
						name = republicanNames[i];
						var indexOfName = data.names.indexOf(name);
						var dataNamesArrayHasName = indexOfName != -1;
						var current = data.avgs[indexOfName];
						if(dataNamesArrayHasName) {
							setAvgForName.call(this, name, current);
						}
						else {
							setInactive.call(this, name);
						}
						evaluateIfAvgHasChanged.call(this, name, current);
					}
				}

				return changed;
			},
			postScrape : function() {
				console.log("\nAfter scraping, republican stats are:", this.stats);
			},
			conditions : [
				{
					description : 'Someone changed',
					text : {},
					active : true,
					check : function(data){
						var changed = getChanged.call(republicanScraper);
						if(changed && changed.length) {
							return true;
						}
						return false;
					},
					isMet : function(data) {
						var message = createChangedMessage.call(republicanScraper);
						this.text.message = message;
					}
				},
				{
					description : 'Trump greater than 35%',
					text : {},
					active : true,
					check : function(data){
						if(getHasChanged.call(republicanScraper, 'Trump')
							&& getCurrentPercentage.call(republicanScraper, 'Trump') < 35) {
							return true;
						}
						return false;
					},
					isMet : function(data) {
						this.text.message = "BUY NO SHARES NOW!!!! Trump percentage is: " + getCurrentPercentage.call(republicanScraper, 'Trump') + "%!";
					}
				},
				{
					description : 'Bush was removed from RCP',
					text : {
						message : "BUSH DROPPED SELL SELL SELL"
					},
					active : true,
					check : function(data) {
						if(getHasChanged.call(republicanScraper, 'Bush')
							&& getInactive.call(republicanScraper, 'Bush')) {
							return true;
						}
						return false;
					},
					isMet : function(data) {
					}
				},
				{
					description : 'Bush over 5%',
					text : {
						message : "BUSH OVER 5% HOLY CRAP BUY YES!!!"
					},
					active : true,
					check : function(data) {
						if(getHasChanged.call(republicanScraper, 'Bush')
							&& getCurrentPercentage.call(republicanScraper, 'Bush' > 5)) {
							return true;
						}
						return false;
					},
					isMet : function(data) {
					}
				},
				{
					description : 'Rubio below 15%',
					text : {
						message : "RUBIO IS BELOW 15% HOLY CRAP BUY NO!!!!!"
					},
					active : true,
					check : function(data) {
						if(getHasChanged.call(republicanScraper, 'Rubio')
							&& getCurrentPercentage.call(republicanScraper, 'Rubio') < 15) {
							return true;
						}
						return false;
					},
					isMet : function(data) {
					}
				},
				{
					description : 'Carson below 7%',
					text : {
						message : "CARSON IS BELOW 7% HOLY CRAP BUY NO!!!!!"
					},
					active : true,
					check : function(data) {
						if(getHasChanged.call(republicanScraper, 'Carson')
							&& getCurrentPercentage.call(republicanScraper, 'Carson') < 7) {
							return true;
						}
						return false;
					},
					isMet : function(data) {
					}
				},
				{
					description : 'Cruz over 20%',
					text : {
						message : "SELL CRUZ NO, BUY CRUZ YES"
					},
					active : true,
					check : function(data) {
						if(getHasChanged.call(republicanScraper, 'Cruz')
							&& getCurrentPercentage.call(republicanScraper, 'Cruz') >= 20) {
							return true;
						}
						return false;
					},
					isMet : function(data) {
					}
				},
				{
					description : 'Kasich blow 2%',
					text : {
						message : "KASICH IS BELOW 2% HOLY CRAP BUY NO!!!!!"
					},
					active : true,
					check : function(data) {
						if(getHasChanged.call(republicanScraper, 'Kasich') && getCurrentPercentage.call(republicanScraper, 'Kasich') < 2) {
							return true;
						}
						return false;
					},
					isMet : function(data) {
					}
				}
			]
		};

		// DEMOCRATIC SCRAPER
		var democraticScraper = {
			track : ['Sanders', 'Clinton'],
			url : 'http://www.realclearpolitics.com/epolls/2016/president/us/' +
			'2016_democratic_presidential_nomination-3824.html',
			moduleName : 'Check all democratic candidates',
			//preValidate : function(data) {
			//},
			postScrape : function() {
				console.log("\n\n");
				logger.info("After scraping, democratic stats are:", this.stats);
			},
			onChange : {
				all : {
					text : false,
					message : function(header) {
						var message = "ALL: " + header + " changed from " + this.stats[header].avg.previous +
							" to: " + this.stats[header].avg.current;
						return message;
					}
				}
			},
			onThresholdChange : {
				all : {
					text : true,
					message : function(header) {
						var statObject = this.stats[header].avg;
						var oldThreshold = statObject.threshold.previous;
						var newThreshold = statObject.threshold.current;
						var message = "\nALL: " + header + " Changed Threshold";
						message += "\n\n Old: " + oldThreshold;
						message += "\n\n New: " + newThreshold;
						message += "\n\n Current Value: " + this.stats[header].avg.current + "%";
						return message;
					}
				}
			},
			trigger : {
				//Sanders : {
				//	thresholds : [
				//		{
				//			below : {
				//				value : 100,
				//				inclusive : true
				//			},
				//			above : {
				//				value : 50,
				//				inclusive : true
				//			}
				//		},
				//		{
				//			below : {
				//				value : 50,
				//				inclusive : false
				//			},
				//			above : {
				//				value : 37,
				//				inclusive : true
				//			}
				//		}
				//	],
				//	action : function() {
				//
				//	}
				//}

			}
		};

		var obamaJobApprovalScraper = {
			url :'http://www.realclearpolitics.com/epolls/other/president_obama_job_approval-1044.html',
			track : ['Approve'],
			moduleName : 'Check Obama Job Approval',
			postScrape : function() {
				console.log("\n\n");
				logger.info("After scraping, obama stats are:", this.stats);
			},
			onChange : {
				all : {
					text : true,
					message : function(header) {
						var message = "ALL: " + header + " changed from " + this.stats[header].avg.previous +
							" to: " + this.stats[header].avg.current;
						return message;
					}
				}
			},
			trigger : {
				Approve : {
					thresholds : [
						{
							//below : {
							//	value : 100,
							//	inclusive : true
							//},
							above : {
								value : 49.5,
								inclusive : true
							}
						},
						{
							below : {
								value : 49.4,
								inclusive : true
							},
							above : {
								value : 49.0,
								inclusive : true
							}
						},
						{
							below : {
								value : 48.9,
								inclusive : true
							},
							above : {
								value : 48.5,
								inclusive : true
							}
						},
						{
							below : {
								value : 48.4,
								inclusive : true
							},
							above : {
								value : 48.0,
								inclusive : true
							}
						},
						{
							below : {
								value : 47.9,
								inclusive : true
							}
							//above : {
							//	value : 0,
							//	inclusive : true
							//}
						}
					],
					action : function() {

					}
				}

			},
			onThresholdChange : {
				all : {
					text : true,
					message : function(header) {
						var statObject = this.stats[header].avg;
						var oldThreshold = statObject.threshold.previous;
						var newThreshold = statObject.threshold.current;
						var message = "\nALL: " + header + " Changed Threshold";
						message += "\n\n Old: " + oldThreshold;
						message += "\n\n New: " + newThreshold;
						message += "\n\n Current Value: " + this.stats[header].avg.current + "%";
						return message;
					}
				}
			}
		}

		var gallup = {
			url : 'http://www.gallup.com/poll/113980/gallup-daily-obama-job-approval.aspx?version=print',
			find : {
				date : x('#tabulardata tr td.col-text'),
				value : x('#tabulardata tr td:nth-of-type(2)')
			},
			preValidate : function(data) {
				if(!this.stats) {
					this.stats = {
						date : {
							current : false,
							previous : false,
							changed : false
						},
						value : {
							current : false,
							previous : false,
							changed : false
						}
					};
				}
				this.stats.date.previous = this.stats.date.current;
				this.stats.date.current = data.date;
				this.stats.value.previous = this.stats.value.current;
				this.stats.value.current = data.value;
				if(this.stats.date.previous != this.stats.date.current
					&& this.stats.date.previous !== false) {
					this.stats.date.changed = true;
				}
				else {
					this.stats.date.changed = false;
				}
			},
			postScrape : function() {
				console.log("\n\n");
				logger.info("After scraping, gallup stats are:", this.stats);
			},
			conditions : [
				{
					description : 'Date changed',
					text : {},
					active : true,
					check : function(data){
						var changed = this.stats.date.changed;
						if(changed) {
							return true;
						}
						return false;
					},
					isMet : function(scraperObject, data) {
						var message = "GALLUP POSTED FOR " + scraperObject.stats.date.current + " " +
							"\nOLD: " + scraperObject.stats.value.previous +
							"\nNEW: " + scraperObject.stats.value.current;
						this.text.message = message;
					}
				},
			]
		}
		var CNN = {
			url : 'http://www.cnn.com/2016/03/21/politics/2016-election-poll-results-toplines/',
			find : {
				date : x('.update-time')
			},
			preValidate : function(data) {
				if(!this.date) {
					this.date = {
						current : false,
						previous : false,
						changed : false
					}
				}
				this.date.previous = this.date.current;
				this.date.current = data.date;
				if(this.date.previous != this.date.current
					&& this.date.previous !== false) {
					this.date.changed = true;
				}
				else {
					this.date.changed = false;
				}
			},
			postScrape : function() {
				console.log("\n\n");
				logger.info("After scraping, CNN date is:", this.date);
			},
			conditions : [
				{
					description : 'Date changed',
					text : {},
					active : true,
					check : function(data){
						var changed = this.date.changed;
						if(changed) {
							return true;
						}
						return false;
					},
					isMet : function(scraperObject, data) {
						var message = "CNN CHANGED!!!!!!!!" +
							"\nOLD: " + scraperObject.date.previous +
							"\nNEW: " + scraperObject.date.current;
						this.text.message = message;
					}
				},
			]
		}

		var MNDemocraticCaucus = {
			url : 'https://www.google.com/webhp?sourceid=chrome-instant&ion=' +
			'1&espv=2&ie=UTF-8#q=democratic%20minnesota%20primary&eob=m.04ykg/D/2/short/m.04ykg/',
			find : {
				data : x('._tN._Wtj.mod')
			},
			preValidate : function(data) {
				console.log("THIS.DATA IS:", data);
			},
			postScrape : function() {
				console.log("\n\n");
				logger.info("After scraping, MNDem stats are:", this.stats);
			},
			conditions : [
			]
		};

		var MNScrapeFind =
			x('.wpe-card.wpe-card_state', [
				{
					party : '.wpe-card_headline',
					reporting : '.wpe-card_reporting',
					candidates : x('.wpe-table_row', [
						{
							name : x('.wpe-table_cell_candidate'),
							percent : x('.wpe-table_cell_votes')
						}
					])
				}
			]);
		var MNScrape = {
			find: MNScrapeFind,
			stats: {},
			url: 'https://www.washingtonpost.com/2016-election-results/minnesota/',
			moduleName: 'Check all republican candidates',
			init: function () {
				console.log("INIT");
			},
			preValidate : function(data) {
				logger.info("The data coming in is:", data);
			},
			conditions : [
				{

				}
			]
		};

		var rightDirection = {
			track : ['Right Direction'],
			url : 'http://www.realclearpolitics.com/epolls/other/direction_of_country-902.html',
			onChange : {
				all : {
					text : true,
					message : function(header) {
						var message = "ALL: RightDirection " + header + " changed from " + this.stats[header].avg.previous +
							" to: " + this.stats[header].avg.current;
						return message;
					}
				}
			},
			postScrape : function() {
				console.log("\n\n");
				logger.info("After scraping, RightDirection stats are:", this.stats);
			},
			trigger : {
				'Right Direction' : {
					thresholds : [
						{
							below : {
								value : 100,
								inclusive : true
							},
							above : {
								value : 27.5,
								inclusive : true
							}
						},
						{
							below : {
								value : 27.5,
								inclusive : false
							},
							above : {
								value : 0,
								inclusive : true
							}
						}
					]
				}

			},
			onThresholdChange : {
				all : {
					text : true,
					message : function(header) {
						var statObject = this.stats[header].avg;
						var oldThreshold = statObject.threshold.previous;
						var newThreshold = statObject.threshold.current;
						var message = "\nALL: RightDirection " + header + " Changed Threshold";
						message += "\n\n Old: " + oldThreshold;
						message += "\n\n New: " + newThreshold;
						message += "\n\n Current Value: " + this.stats[header].avg.current + "%";
						return message;
					}
				}
			}
		};

		var congressionalJobApproval = {
			track : ['Approve'],
			url : 'http://www.realclearpolitics.com/epolls/other/congressional_job_approval-903.html',
			onChange : {
				all : {
					text : true,
					message : function(header) {
						var message = "ALL: Congressional Job Approval " +
							"" + header + " changed from " + this.stats[header].avg.previous +
							" to: " + this.stats[header].avg.current;
						return message;
					}
				}
			},
			postScrape : function() {
				console.log("\n\n");
				logger.info("After scraping, Congressional Job Approval stats are:", this.stats);
			},
			trigger : {
				'Approve' : {
					thresholds : [
						{
							below : {
								value : 100,
								inclusive : true
							},
							above : {
								value : 12,
								inclusive : true
							}
						},
						{
							below : {
								value : 12,
								inclusive : false
							},
							above : {
								value : 0,
								inclusive : true
							}
						}
					]
				}

			},
			onThresholdChange : {
				all : {
					text : true,
					message : function(header) {
						var statObject = this.stats[header].avg;
						var oldThreshold = statObject.threshold.previous;
						var newThreshold = statObject.threshold.current;
						var message = "\nALL: Congressional Job Approval " + header + " Changed Threshold";
						message += "\n\n Old: " + oldThreshold;
						message += "\n\n New: " + newThreshold;
						message += "\n\n Current Value: " + this.stats[header].avg.current + "%";
						return message;
					}
				}
			}
		};


		var congressionalJobApprovalRCPScraper = new rcpScraper(congressionalJobApproval);
		var rightDirectionRCPScraper = new rcpScraper(rightDirection);
		var gallupScraper = new simpleScraper(gallup);
		var republicans = new simpleScraper(republicanScraper); // Works
		var democrats = new rcpScraper(democraticScraper);
		var obama = new rcpScraper(obamaJobApprovalScraper);
		var MNDem = new simpleScraper(MNScrape);
		var CNNScraper = new simpleScraper(CNN);

		//// CNN
		//new CronJob('0,2,5,7,10,12,15,17,20,22,25,27,30,32,35,33,40,42,45,47,50,53,55 * * * * *', function() {
		//	CNNScraper.scrape().then(function(){
		//		CNNScraper.busy = false;
		//	}).catch(logger.error);
		//}, null, true, 'America/New_York');

		// rightDirection
		//new CronJob('0,2,5,7,10,12,15,17,20,22,25,27,30,32,35,33,40,42,45,47,50,53,55 * * * * *', function() {
		//	rightDirectionRCPScraper.scrape().then(function(){
		//		rightDirectionRCPScraper.busy = false;
		//	}).catch(logger.error);
		//}, null, true, 'America/New_York');

		// REALCLEARPOLITICS Obama Approval
		new CronJob('0,2,5,7,10,12,15,17,20,22,25,27,30,32,35,33,40,42,45,47,50,53,55 * * * * *', function() {
			obama.scrape().then(function(){
				obama.busy = false;
			}).catch(logger.error);
		}, null, true, 'America/New_York');

		new CronJob('0,2,5,7,10,12,15,17,20,22,25,27,30,32,35,33,40,42,45,47,50,53,55 * * * * *', function() {
			congressionalJobApprovalRCPScraper.scrape().then(function(){
				congressionalJobApprovalRCPScraper.busy = false;
			}).catch(logger.error);
		}, null, true, 'America/New_York');

		//// REALCLEARPOLITICS Right Direction
		//new CronJob('0,5,10,15,20,25,30,35,40,45,50,55 * * * * *', function() {
		//	rightDirectionRCPScraper.scrape().then().catch(logger.error);
		//}, null, true, 'America/New_York');
		//
		//// REALCLEARPOLITICS Congressional Job Approval
		//new CronJob('0,5,10,15,20,25,30,35,40,45,50,55 * * * * *', function() {
		//	congressionalJobApprovalRCPScraper.scrape().then().catch(logger.error);
		//}, null, true, 'America/New_York');
		//
		//// Obama GALLUP approval integer
		//new CronJob('' +
		//'0,5,10,15,20,25,30,35,40,45,50,55 ' +
		//'1,2,3,4,5,6,7,8,9,10,11,12,13,14,15 ' +
		//'12,1 ' +
		//'* ' +
		//'* ' +
		//'*', function() {
		//	gallupScraper.scrape().then().catch(logger.error);
		//}, null, true, 'America/New_York');
	}
}
var request = require('supertest'),
	config = require("../../../../config/environment"),
	async = require("async"),
	expect = require('chai').expect,
	ON = true
	;

var setup = require("../../../../app_v2/test/setup/test-setup.js");
describe.only('certifications meta spec', function() {
	if(ON) {
		before(function (done) {
			certificationsMetaUpdater = setup.architect.getService('certificationsMetaUpdater');
			trainerModel = setup.architect.getService('trainerModel');
			done();
		});

		it('should be done',
			function (done) {
				var foundTrainer
				;
				this.timeout(10000);
				// increase timeout since downloading can take a while
				async.waterfall([
					function getTrainer(callback) {
						console.log("Getting trainer");
						trainerModel.findById('5761e930c0d0be1c13e39b25', function(err, trainer){
							console.log("got trainer:", trainer.email);
							foundTrainer = trainer;
							if(err) return callback(err);
							callback();
						});
					},
					function metaUpdater(callback) {
						certificationsMetaUpdater.update(foundTrainer).then(function(response){
							console.log("RESPONSE:", response);
							callback();
						}).catch(callback);
					}
				], function(err, response){
					if(err) return done(err);
					return done(null);
				});
			});
	}
});

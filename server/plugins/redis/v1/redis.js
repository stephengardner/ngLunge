var redis = require("redis");
var config = require("../../../config/environment");
module.exports = function setup(options, imports, register) {
	var client;
	if(config.redis.redisToGoURL) {
		//var rtg   = require("url").parse(config.redis.redisToGoURL);
		//client = require("redis").createClient(rtg.port, rtg.hostname, {return_buffers : true});
		//client.auth(rtg.auth.split(":")[1]);
		var	redisParams   = require("url").parse(config.redis.redisToGoURL);
		var port = redisParams.port;
		var hostname = redisParams.hostname;
		var pass = redisParams.auth.split(":")[1];

		// create the pub/sub using redis clients.  This works.  return_buffers must be set to true according to the docs
		client = redis.createClient(port, hostname, {auth_pass : pass, return_buffers : true});
		//console.log("Redis client?", client);
	}
	else {
		client = redis.createClient();
		client.auth("testpassword", function() {
			console.log("--\nCONNECTED TO REDIS\n--!");
		});
	}
	register(null, {
		redis : client
	})
}
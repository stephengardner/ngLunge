module.exports = function(config) {
	var architect = require("architect");
	var appConfig = [
		{
			packagePath : '../app_v2',
			config : config,
			handleQueues : config.handleQueues,
			server : config.handleServer
		},
		{
			packagePath : "../plugins/connections/database",
			config : config
		},
		"../plugins/connector/v1",
		{
			packagePath : "../plugins/connections/v1",
			config : config
		},
		"../plugins/eventbus",
		"../components-v2/logger",
		// WARNING for some reason the order of the models MATTERS here
		"./models/trainer/v1",
		"./models/certification-organization/v1",
		"./models/certification-type/v1",
		"./models/specialty/v1",
		//"../plugins/models/v1",
		{
			packagePath : "../plugins/socket/v1",  
			config : config
		},
		{
			packagePath : "./models/trainer/v1/socket",
			config : config
		},
		{
			packagePath : "./models/certification-organization/v1/socket",
			config : config
		},
		//"../plugins/server/v1",
		"../plugins/app/v1",
		"../plugins/redis/v1",
		"../plugins/bruteforce/v1"
	];
	var tree = architect.resolveConfig(appConfig, __dirname);
	return tree;
}
module.exports = function(config) {
	var architect = require("architect");
	var appConfig = [
		"../../plugins/connector/v1",
		{
			packagePath : "../../plugins/connections/v1",
			config : config
		},
		{
			packagePath : "../../plugins/connections/v1/database",
			config : config
		},
		"../../plugins/eventbus",
		// WARNING for some reason the order of the models MATTERS here
		"../models/trainer/v1",
		"../models/certification-organization/v1",
		"../models/certification-type/v1",
		"../models/specialty/v1",
		"../../components-v2/certification-map-creator",
		"../../components-v2/logger",
		"../../plugins/models/v1",
		"../../plugins/redis/v1",
		"../../scraper/components/scraper/v1"
	];
	var tree = architect.resolveConfig(appConfig, __dirname);
	return tree;
}
module.exports = function(config) {
	var architect = require("architect");
	var appConfig = [
		"../../plugins/eventbus",
		"../../scraper-predictit/components/bush",
		"../../scraper-predictit/components/simple-scraper",
		"../../scraper-predictit/components/simple-scraper/utils/rcp/scraper"
	];
	var tree = architect.resolveConfig(appConfig, __dirname);
	return tree;
}

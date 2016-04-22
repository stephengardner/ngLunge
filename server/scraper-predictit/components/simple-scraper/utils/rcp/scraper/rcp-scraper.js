module.exports = function setup(options, imports, register) {
	var rcpScraper = imports.simpleScraper;
	register(null, {
		rcpScraper : rcpScraper
	})
}
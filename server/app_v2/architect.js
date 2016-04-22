module.exports = function(config) {
	var architect = require("architect");
	var appConfig = [
		{
			packagePath : '../app_v2',
			config : config,
			handleQueues : config.handleQueues,
			server : config.handleServer
		},
		"../app_v2/amqp/jackrabbit",
		"../app_v2/amqp/jackrabbit/queues/feed/v1",
		"../app_v2/amqp/jackrabbit/queues/property/entrata-update/v1",
		"../app_v2/amqp/jackrabbit/queues/property/update/v1",
		"../app_v2/amqp/jackrabbit/queues/file/v1",
		"../app_v2/amqp",
		{
			packagePath : "../plugins/models/v1",
			config : config
		},
		'../plugins/eventbus',
		"../plugins/connector/v1",
		{
			packagePath : "../plugins/connections/v1",
			config : config
		},
		// PrimlineV2
		"../primeline_v2",
		"../primeline_v2/activity/v1",
		'../primeline_v2/feeds/entrata/api/methods/v1',
		'../primeline_v2/feeds/entrata/api/transformers',
		'../primeline_v2/feeds/entrata/api/transformers/properties/v1',
		'../primeline_v2/feeds/entrata/api/transformers/units/v1',
		'../primeline_v2/feeds/entrata/api/transformers/floorplans/v1',
		'../primeline_v2/feeds/entrata/api/savers',
		'../primeline_v2/feeds/entrata/api/savers/feed/v1',
		'../primeline_v2/feeds/entrata/api/savers/property/v1',
		{
			packagePath : '../primeline_v2/feeds/entrata/api/updaters/property/v1',
			logActivity : true,
			saveProperties : true
		},,
		{
			packagePath : '../primeline_v2/feeds/entrata/api/updaters/feed/v1',
			logActivity : true,
			saveProperties : true
		},
		'../primeline_v2/feeds/entrata/file-feed/parser/v1',
		'../primeline_v2/feeds/entrata/file-feed/transformers/v2',
		'../primeline_v2/feeds/entrata/file-feed',
		'../primeline_v2/feeds/entrata/api/updaters',
		'../primeline_v2/feeds/entrata/get-next/v1',
		'../primeline_v2/get-next/v1',
		'../primeline_v2/updaters',
		'../primeline_v2/updaters/property/v1',
		'../search/v2',
		'../search/v2/query-builder/v1'
		/*,
		{
			packagePath : '../primeline_v2/entrata/updaters/feed/v1',
			logActivity : true,
			saveProperties : true
		}
		*/
	];
	var tree = architect.resolveConfig(appConfig, __dirname);
	return tree;
}
module.exports = function(config) {
	var architect = require("architect");
	var appConfig = [
		{
			packagePath : '../../app_v2',
			config : config,
			handleQueues : config.handleQueues,
			server : config.handleServer
		},
		"../../plugins/connector/v1",
		"../../components-v2/logger",
		//{
		//	packagePath : "../../plugins/connections/v1",
		//	config : config
		//},
		{
			packagePath : "../../plugins/connections/v1/database",
			config : config
		},
		"../../plugins/eventbus",

		// MODELS
		// WARNING for some reason the order of the models MATTERS here
		"../models/trainer/v1",
		"../models/certification-organization/v1",
		"../models/certification-type/v1",
		"../models/specialty/v1",
		"../models/registration",
		"../models/user",
		//"../../plugins/models/v1",
		{
			packagePath : "../../plugins/socket/v1",
			config : config
		},
		{
			packagePath : "../models/trainer/v1/socket",
			config : config
		},
		{
			packagePath : "../models/certification-organization/v1/socket",
			config : config
		},

		// PLUGINS
		{
			packagePath : "../../plugins/server/v1",
			server : config.handleServer
		},
		"../../plugins/redis/v1",
		"../../plugins/routes",
		"../../plugins/express",
		"../../plugins/bruteforce/v1",
		// s3
		"../../plugins/s3",

		// API
		// aws
		//"../../app_v2/api/aws/controller",
		//"../../app_v2/api/aws/router",
		// trainer
		"../../app_v2/api/trainer/controller",
		"../../app_v2/api/trainer/router",
		// certification
		"../../app_v2/api/certification/controller",
		"../../app_v2/api/certification/router",
		// certification type
		"../../app_v2/api/certification-type/controller",
		"../../app_v2/api/certification-type/router",
		// certification organization
		"../../app_v2/api/certification-organization/controller",
		"../../app_v2/api/certification-organization/router",
		// specialty
		"../../app_v2/api/specialty/controller",
		"../../app_v2/api/specialty/router",
		// registration
		"../../app_v2/api/registration/controller",
		"../../app_v2/api/registration/router",
		// regular user
		"../../app_v2/api/user/controller",
		"../../app_v2/api/user/router",


		// COMPONENTS
		// image components
		//"../../components-v2/images/profile-picture/local-upload",
		//"../../components-v2/images/profile-picture/s3-upload",
		"../../components-v2/images/profile-picture/crop",
		// location processor
		"../../components-v2/location/trainer/parser",
		"../../components-v2/location/trainer/saver",

		// AUTH
		"../../components-v2/auth/routes",
		"../../components-v2/auth/service",
		"../../components-v2/auth/strategies/local/router",
		"../../components-v2/auth/strategies/local/passport",
		"../../components-v2/auth/strategies/facebook/router",
		"../../components-v2/auth/strategies/facebook/passport",
		"../../components-v2/auth/strategies/twitter/router",
		"../../components-v2/auth/strategies/twitter/passport",
		"../../components-v2/auth/strategies/linkedin/router",
		"../../components-v2/auth/strategies/linkedin/passport",
		"../../components-v2/auth/strategies/instagram/router",
		"../../components-v2/auth/strategies/instagram/passport",

		// certification map creator
		"../../components-v2/certification-map-creator",

		// certification document uploader
		"../../components-v2/certification/document-upload",

		// certification s3 document uploader
		"../../components-v2/certification/document-s3-upload",

		// certification document add to trainer
		"../../components-v2/certification/document-add-to-trainer",

		// certification document process
		"../../components-v2/certification/document-process",

		// certification document prevalidate
		"../../components-v2/certification/document-prevalidate",

		// certification document prevalidate
		"../../components-v2/certification/document-remove-from-trainer",

		// certification document prevalidate
		"../../components-v2/certification/document-remove-from-trainer",

		// certification document prevalidate
		"../../components-v2/certification/populator",

		// certification document prevalidate
		"../../components-v2/certification/remove-local-file",

		// certification document prevalidate
		"../../components-v2/trainer/populator/certifications-aggregated",

		// certification document prevalidate
		"../../components-v2/trainer/populator/get-single-certification-by-id",

		// trainer contact email
		"../../components-v2/trainer/contact/email",

		// profile picture uploader
		"../../components-v2/profile-picture-uploader/upload-local",
		"../../components-v2/profile-picture-uploader/upload-s3",
		"../../components-v2/picture-cropper",

		// custom mandrill
		"../../components-v2/custom-mandrill/sender/v1",

		// registration
		"../../components-v2/registration/trainer/sign-up",

		// certification document prevalidate
		"../../plugins/error-formatter"

	];
	var tree = architect.resolveConfig(appConfig, __dirname);
	return tree;
}
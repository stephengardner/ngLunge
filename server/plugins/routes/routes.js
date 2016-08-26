
var errors = require('../../components/errors'),
	compression = require('compression');
module.exports = function setup(options, imports, register) {
	var web = imports.express;
	var routes = {
		attach : function() {
			console.log(" \n ---- attaching routes ---- \n");
			web.use('/api/trainers', imports.apiTrainerRouter);
			web.use('/api/certifications', imports.apiCertificationRouter);
			web.use('/api/certification-types', imports.apiCertificationTypeRouter);
			web.use('/api/certification-organizations', imports.apiCertificationOrganizationRouter);
			web.use('/api/specialties', imports.apiSpecialtyRouter);
			web.use('/api/users', imports.apiUserRouter);
			web.use('/api/chats', imports.apiChatRouter);
			//express.use('/api/aws', imports.apiAWSRouter);
			web.use('/auth', imports.authRoutes);
			web.use('/api/registrations', imports.apiRegistrationRouter);
			console.log("App Path in Routes.js is:", web.get('appPath'));
			web.route('/:url(api|auth|components|app|bower_components|assets)/*')
				.get(errors[404]);
			web.route('/*')
				.get(function(req, res) {
					res.sendFile('/index.html', { root : web.get('appPath') });
				});
			// I don't know why, but compression messed up with url rerouting.  This must be AFTER the route /*
			// which redirects all routes to index.html
			web.use(compression());
		}
	};
	register(null, {
		routes : routes
	})
}
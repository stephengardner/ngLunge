
var errors = require('../../components/errors');
module.exports = function setup(options, imports, register) {
	var express = imports.express;
	var routes = {
		attach : function() {
			console.log("The app path is:", express.get('appPath'));
			express.set('json spaces', 2);
			express.set('json replacer', express.get('json replacer'));

			// API Endpoints
			express.use('/api/trainers', imports.apiTrainerRouter);
			express.use('/api/certifications', imports.apiCertificationRouter);
			express.use('/api/certification-types', imports.apiCertificationTypeRouter);
			express.use('/api/certification-organizations', imports.apiCertificationOrganizationRouter);
			express.use('/api/specialties', imports.apiSpecialtyRouter);
			//express.use('/api/aws', imports.apiAWSRouter);
			express.use('/auth', imports.authRoutes);
			express.use('/api/registrations', imports.apiRegistrationRouter);

			express.route('/:url(api|auth|components|app|bower_components|assets)/*')
				.get(errors[404]);
			express.route('/*')
				.get(function(req, res) {
					res.sendFile('/index.html', { root : express.get('appPath') });
				});
		}
	}
	register(null, {
		routes : routes
	})
}
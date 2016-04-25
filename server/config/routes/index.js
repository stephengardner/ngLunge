var bodyParser = require('body-parser');

module.exports = function(app) {

	function wwwRedirect(req, res, next) {
		if (req.headers.host.slice(0, 4) === 'www.') {
			var newHost = req.headers.host.slice(4);
			return res.redirect(req.protocol + '://' + newHost + req.originalUrl);
		}
		next();
	};

	// FORCE 200 RESPONSES DURING DEVELOPMENT
	function force200Responses(req, res, next) {
		req.headers['if-none-match'] = 'no-match-for-this';
		next();
	}

	busboy = require('connect-busboy');
	app.use(busboy());
	app.use(bodyParser.json());
	app.set('trust proxy', true);
	app.use(wwwRedirect);
	if(process.env.NODE_ENV != "production")
		app.use(force200Responses);

	// TODO Remove password and set in config
	//app.use(require('prerender-node').set('prerenderToken', 'gzjdwTTaxq127132SXOw'));

	// for pretty printing JSON on our API routes
	app.set('json spaces', 2);
	app.set('json replacer', app.get('json replacer'));
}
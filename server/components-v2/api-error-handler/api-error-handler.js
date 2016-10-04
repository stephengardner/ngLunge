var _ = require('lodash')
;
module.exports = function(options, imports, register) {
	var logger = imports.logger.info;
	
	var apiErrorHandler = {
		handleError : function(res, err) {
			logger.error(err);
			logger.info(err.errors);
			console.log(err.message);
			var e = new Error();
			_.merge(e, err);
			e.message = err.message;
			e.logger = undefined;
			return res.status(500).send(e);
		}
	};
	register(null, {
		apiErrorHandler : apiErrorHandler
	})
}
var logger = require("../logger")();
module.exports = {
	filterDefaultErrors : function(res, err) {
		logger.error(err);
		return res.status(422).json(err);
	}
}
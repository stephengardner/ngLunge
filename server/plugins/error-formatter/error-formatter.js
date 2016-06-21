var _ = require('lodash')
;
module.exports = function setup(options, imports, register) {
	var errorFormatter = {
		format : function(err, cb) {
			return errorHelper(err, cb);
		},
		customValidationError : function(object) {
			//var err = new Error();
			var err = {
				message : 'Custom Validation Failed',
				name : 'CustomValidationError',
				errors : {
				}
			};
			err.errors[object.path] = {
				message : object.message,
				name : 'CustomValidationError',
				path : object.path,
				type : 'custom'
			};
			console.log("Returning validation error:", err);
			//err = _.merge(err, object);
			return err;
		}
	}
	function errorHelper(err, cb) {


		//If it isn't a mongoose-validation error, just throw it.
		console.log("hmmm heres the err:", err);
		if (err.name !== 'ValidationError') return cb(err);
		var messages = {
			'required': "%s is required.",
			'min': "%s below minimum.",
			'max': "%s above maximum.",
			'enum': "%s not an allowed value."
		};

		//A validationerror can contain more than one error.
		var errors = [];

		//Loop over the errors object of the Validation Error
		Object.keys(err.errors).forEach(function (field) {
			var eObj = err.errors[field];

			//If we don't have a message for `type`, just push the error through
			if (!messages.hasOwnProperty(eObj.type)) errors.push(eObj.type);

			//Otherwise, use util.format to format the message, and passing the path
			else errors.push(require('util').format(messages[eObj.type], eObj.path));
		});

		console.log("Errorformatter calling back with errors:", errors);

		return cb(errors);
	}
	register(null, {
		errorFormatter : errorFormatter
	});
};
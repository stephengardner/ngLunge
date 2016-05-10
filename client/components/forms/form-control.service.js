lungeApp.factory("FormControl", function(broadcastService, lodash){
	var FormControl = function() {
	};
	FormControl.prototype = {
		errors : {},
		resetErrors : function() {
			this.errors = {};
		},

		// new, will remove every err that could possibly have been set on the given form object
		removeAllMongooseErrors : function(form) {
			for(var input in form) {
				if(form[input] && form[input].$setValidity) {
					form[input].$setValidity('mongoose', true);
				}
				delete this.errors[input];
			}
		},
		removeMongooseError : function(form, inputName) {
			//console.log("Removing mongoose error for :", inputName);
			if(!form[inputName] || !form[inputName].$error) {
				return false;
			}
			if(inputName.indexOf("rent") != -1) {
				form['rentMin'].$setValidity('mongoose', true);
				form['rentMax'].$setValidity('mongoose', true);
				delete this.errors['rent'];
			}
			form[inputName].$setValidity('mongoose', true);
			if(form[inputName] && form[inputName].$error) {
				form[inputName].$error.mongoose = false;
			}
			if(this.errors && inputName) {
				delete this.errors[inputName];
			}

			// not used just yet, but can be.  instead we're using a $watch in the controller
			//FormControl.broadcast('form.updated');
		},
		broadcast : function(msg, obj) {
			broadcastService.send(msg, obj);
		},
		setError : function(form, propertyName, errorMessage) {
			console.log(" [FormControl] Setting form." + propertyName + " to error: ", errorMessage);
			if(form && form[propertyName]) {
				form[propertyName].$setValidity('mongoose', false);
			}
			if(errorMessage && this.errors) {
				this.errors[propertyName] = errorMessage;
			}
			console.log(" [FormControl] this.errors is now:", this.errors);
			return false;
		},
		parseValidationErrors : function(form, err){
			var self = this;
			this.resetErrors();
			//form.$setPristine(); // not sure if this is wanted - but was in the trainer basic info controller
			// Update validity of form fields that match the mongoose errors
			if(!err.errors && err.data && err.data.errors) {
				// we passed in the wrong object, we should have passed in err.data but we just passed in err
				// in this case, just help the user out and infer that we wanted err.data
				err.errors = lodash.merge({}, err.data.errors);
				console.log("ok : ", err);
			}
			angular.forEach(err.errors, function(error, field) {
				// fieldCheck = field;
				try {
					console.log(" [FormControl] trying to set:", field, " with ", error);
					self.setError(form, field, error.message);
					form[field].$error.mongoose = error.message;
					// Augie - New, set up an error message on the form itself.
					// if(!form.errors) form.errors = {};
					// if(!form.errors[field]) form.errors[field] = {};
					// form.errors[field] = error.message;
				}
				catch (err) {
					console.log(" [FormControl] FormControl caught an error, ", err);
					if(field == "city" || field == "state" || field == "zipcode") {
						self.setError(form, 'location', error.message);
					}
				}
			});
			form.errors = this.errors;

			// not used just yet, but can be.  instead we're using a $watch in the controller
			//this.broadcast('form.parsed');
		}
	}
	return new FormControl();
});
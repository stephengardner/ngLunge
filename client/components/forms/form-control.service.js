lungeApp.factory("FormControl", function(broadcastService){
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
			console.log("Removing mongoose error for :", inputName);
			if(!form[inputName] || !form[inputName].$error) {
				return false;
			}
			if(inputName.indexOf("rent") != -1) {
				form['rentMin'].$setValidity('mongoose', true);
				form['rentMax'].$setValidity('mongoose', true);
				delete this.errors['rent'];
			}
			form[inputName].$setValidity('mongoose', true);
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
			console.log("Setting form." + propertyName + " to error: ", errorMessage);
			if(form && form[propertyName]) {
				form[propertyName].$setValidity('mongoose', false);
			}
			if(errorMessage && this.errors) {
				this.errors[propertyName] = errorMessage;
			}
			console.log("this.errors is now:", this.errors);
			return false;
		},
		parseValidationErrors : function(form, err){
			var self = this;
			err = err.data;
			this.resetErrors();
			form.$setPristine(); // not sure if this is wanted - but was in the trainer basic info controller
			// Update validity of form fields that match the mongoose errors
			angular.forEach(err.errors, function(error, field) {
				fieldCheck = field;
				try {
					console.log("trying to set:", field, " with ", error);
					self.setError(form, field, error.message);
				}
				catch (err) {
					console.log("FormControl caught an error, ", err);
					if(field == "city" || field == "state" || field == "zipcode") {
						self.setError(form, 'location', error.message);
					}
				}
			});

			// not used just yet, but can be.  instead we're using a $watch in the controller
			//this.broadcast('form.parsed');
		}
	}
	return new FormControl();
});
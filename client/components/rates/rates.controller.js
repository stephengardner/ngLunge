myApp.controller("RatesController", function(UserFactory, FormControl, AlertMessage, TrainerFactory, $scope){
	var self = this;
	self.reset = function(form) {
		FormControl.removeAllMongooseErrors(form);
	};
	self.submit = function(form) {
		self.cgBusy = $scope.userFactory.save('rate').then(function(response){
			AlertMessage.success("Rates updated");
			self.editing = false;
		}).catch(function(err){
			form.$setPristine();
			FormControl.parseValidationErrors(form, err);
		})
	};
	self.removeMongooseError = FormControl.removeMongooseError;
});

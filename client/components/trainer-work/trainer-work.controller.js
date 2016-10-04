lungeApp.controller("TrainerWorkController", function($scope,
                                                      AlertMessage,
                                                      $mdDialog,
                                                      FormControl){

	var section = 'work',
		string = 'Work updated',
		self = this
	;

	this.submit = function() {
		self.cgBusy = $scope.userFactory.save(section).then(function(response){
			AlertMessage.success(string);
		}).catch(function(err){
			AlertMessage.error('Woops, something went wrong');
			console.error(err);
		})
	};

	self.toggleRemoveWorkplace = function(workplace) {
		workplace.removing = !workplace.removing;
	};

	self.removeWorkplace = function(workplace) {
		self.cgBusy = $scope.userFactory.removeWorkplace(workplace).then(function(){
			AlertMessage.success('Removed ' + workplace.company_name + ' from your workplaces');
		}).catch(function(err){
			AlertMessage.error('Woops, something went wrong');
		});
	};

	this.testing = 'wtf';
	self.addWorkDialog = function(ev) {
		$mdDialog.show({
			targetEvent : ev,
			templateUrl : 'components/trainer-work/add-work-dialog/trainer-add-work-dialog.partial.html',
			clickOutsideToClose : true,
			scope : $scope,
			preserveScope : true,
			controllerAs : 'vm',
			controller : ['$scope', function($scope){
				this.cancel = $mdDialog.hide;
				this.workplace = {};
				this.submit = function(form) {
					this.cgBusy = $scope.userFactory.addWorkplace(this.workplace).then(function(){
						AlertMessage.success('Workplace added to your profile');
						$mdDialog.hide();
					}).catch(function(err){
						$scope.userFactory.resetEditing('work');
						FormControl.parseValidationErrors(form, err);
						AlertMessage.error('Woops, something went wrong');
					});
				}.bind(this)
			}]
		})
	};
	self.editWorkDialog = function(workplace, ev) {
		$mdDialog.show({
			targetEvent : ev,
			templateUrl : 'components/trainer-work/edit-work-dialog/trainer-edit-work-dialog.partial.html',
			clickOutsideToClose : true,
			scope : $scope,
			preserveScope : true,
			controllerAs : 'vm',
			controller : ['$scope', function($scope){
				this.cancel = $mdDialog.hide;
				for(var i = 0; i < $scope.userFactory.userEditing.work.places.length; i++) {
					var placeAtIndex = $scope.userFactory.userEditing.work.places[i];
					if(placeAtIndex._id == workplace._id){
						foundPlace = true;
						this.workplace = placeAtIndex;
						break;
					}
				}
				this.submit = function(form) {
					this.cgBusy = $scope.userFactory.editWorkplace(this.workplace).then(function(){
						AlertMessage.success('Workplace edited');
						$mdDialog.hide();
					}).catch(function(err){
						FormControl.parseValidationErrors(form, err);
						AlertMessage.error('Woops, something went wrong');
					});
				}.bind(this)
			}]
		})
	}
});
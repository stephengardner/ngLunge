myApp.controller('SpecialtiesDialogController', function($scope,
                                                         TrainerFactory,
                                                         AlertMessage,
                                                         $mdDialog,
                                                         $http,
                                                         $q,
                                                         $mdToast,
                                                         Auth,
                                                         $timeout
) {
	var self = this;

	this.close = function() {
		$mdDialog.cancel();
	};
	
	var specialtiesToChooseFrom = [];

	this.toastSuccess = function($event) {
		var element = angular.element('#specialtiesForm');
		$scope.toast = $mdToast.show({
			parent : angular.element('.md-dialog-container'),
			position: 'top right',
			template : '<md-toast>\
			<span flex>Specialty added!</span>\
			</md-toast>'
		});
	};

	this.setSpecialtyFromTypeahead = function($item, $model, $label){
		console.log("Setting specialty from typeahead");
		self.specialty = $item;
		self.addSpecialty();
	};

	this.submit = function(item){
		if(!self.selectedItem) {
			return;
		}
		console.log("the specialty is:", self.selectedItem);
		self.cgBusy = $scope.userFactory.addSpecialty(self.selectedItem)
			.save('specialties')
			.then(function(response){
				self.toastSuccess();
				spliceSpecialtyToChooseFrom(self.selectedItem);
				self.selectedItem = '';
				self.searchText = '';
				// self.$$childTail.selectedItem = '';
				// self.$$childTail.searchText = '';
			}).catch(function(err){
				$scope.userFactory.resetEditing('specialties');
				AlertMessage.error("Please enter a valid specialty");
				console.log("Caught error:", err);
			})
	};

	self.getSpecialties = function(query){
		if(!query) {
			return [];
		}
		return new $q(function(resolve, reject) {
			$http({
				url : '/api/specialties/query/' + query,
				params : {
					userId: Auth.getCurrentUser()._id
				}
			}).success(function(res){
				console.log("The result is:", res);
				res = res.length ? res : [];
				specialtiesToChooseFrom = res;
				return resolve(specialtiesToChooseFrom);
			}).error(function(res){
				return resolve([]);
			});
		})
	};

	function spliceSpecialtyToChooseFrom(specialty) {
		for(var i = 0; i < specialtiesToChooseFrom.length; i++) {
			var specialtyAtIndex = specialtiesToChooseFrom[i];
			if(specialtyAtIndex &&
				specialtyAtIndex._id == specialty._id){
				specialtiesToChooseFrom.splice(i, 1);
				return;
			}
		}
	}
});
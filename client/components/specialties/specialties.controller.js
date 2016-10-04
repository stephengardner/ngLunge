myApp.controller("SpecialtiesController", function(AlertMessage, $q, $http, $scope, $mdDialog){

	this.resetSpecialty = function(){
		$scope.ajax.busy = false;
	};

	this.showDialog = function(ev) {
		// Appending dialog to document.body to cover sidenav in docs app
		// Modal dialogs should fully cover application
		// to prevent interaction outside of dialog
		$mdDialog.show(
			{
				focusOnOpen : false,
				controller: 'SpecialtiesDialogController',
				controllerAs : 'SpecialtiesDialogCtrl',
				scope : $scope,
				preserveScope : true,
				templateUrl: 'components/specialties/dialog/specialties-dialog.partial.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose:true
			}
		).then(function(location) {

		}, function() {

		});
	};

	this.toggleRemoveSpecialty = function(specialty){
		specialty.removing = !specialty.removing;
	};

	this.removeSpecialty = function(specialty) {
		this.cgBusy = $scope.userFactory.removeSpecialty(specialty)
			.save('specialties')
			.then(function(){
				this.toggleRemoveSpecialty(specialty);
				this.resetSpecialty();
				AlertMessage.success(specialty.name + ' specialty removed');
			}.bind(this)).catch(function(err){
				this.resetSpecialty();
				this.userFactory.resetEditing('specialties');
				AlertMessage.error("Please enter a valid specialty");
				console.log("Caught error:", err);
			}.bind(this))
	}.bind(this);
});

// TODO - evaluate the digest complexity of this controller, make it leaner.  defer scope digests if possible.
lungeApp.controller("CertificationsController", function(TrainerFactory, AlertMessage, socket, Auth, Certification, $http, $scope){
	$scope.searchQuery;
	Auth.isLoggedInAsync(function(){
		$scope.trainerFactory = TrainerFactory;
		TrainerFactory.init(Auth.getCurrentUser());
		TrainerFactory.syncModel();

		$scope.certs = Certification.query({}, function(result){
			$scope.certs = result;
		});
		$scope.selectCert = function(cert) {
			cert.selected = true;
		}
		$scope.toggleCert = function(cert) {
			cert.selected = !cert.selected;
		}
		$scope.deselectCert = function(cert){
			cert.selected = false;
		};
		$scope.addCertType = function(cert_type) {
			Auth.modifyCertification({type : "ADD", certification : cert_type._id}).then(function(response){
				AlertMessage.success("Added 1 " + cert_type.name + " to your profile", {duration : 4000});
			}).catch(function(err){
				AlertMessage.error("Failed adding certificate due to error: " + err, {closeButton : true});
			});
		};
		$scope.removeCertType = function(cert_type) {
			Auth.modifyCertification({type : "DELETE", certification : cert_type._id}).then(function(response){
				AlertMessage.success("Removed 1 " + cert_type.name + " from your profile", {duration : 4000});
			});
		};
		$scope.userHasCertType = function(cert, cert_type) {
			if(!TrainerFactory.trainer.certs) {
				//console.log("User has no certs");
				return false;
			}
			if(!TrainerFactory.trainer.certs[cert.name]){
				//console.log("User has no cert types for: ", cert.name);
				return false;
			}
			for(var i = 0; i < TrainerFactory.trainer.certs[cert.name].length; i++) {
				if(TrainerFactory.trainer.certs[cert.name][i]._id == cert_type._id) {
					//console.log("TRUE");
					return true;
				}
			}
			//console.log("Dead end");
			return false;
		}
		$scope.userHasCert = function(cert) {
			if(!TrainerFactory.trainer.certs || !TrainerFactory.trainer.certs[cert.name]) {
				//console.log("User has no certs");
				return false;
			}
			//console.log("Does user have cert: ", cert, "?", $scope.trainer.certs[cert.name]);
			return TrainerFactory.trainer.certs[cert.name].length;
		};
		$scope.$on('$destroy', function () {
			TrainerFactory.unsyncModel();
		});
	});
});
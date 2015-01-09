lungeApp.controller("CertificationsController", function(AlertMessage, socket, Auth, Certification, $http, $scope){
	$scope.searchQuery;
	Auth.isLoggedInAsync(function(){
		$scope.trainer = Auth.getCurrentUser();
		socket.sync.user('trainer', $scope.trainer,  function(event, newTrainer){
			$scope.trainer = newTrainer;
		});

		$scope.certs = Certification.query({}, function(result){
			console.log("Certs:",result);
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
				console.log("updated...",response);
				$scope.trainer = response;
				AlertMessage.success("Added 1 " + cert_type.name + " to your profile", {duration : 4000});
			}).catch(function(err){
				AlertMessage.error("Failed adding certificate due to error: " + err, {closeButton : true});
				console.log("ERROR ADDING CERT:" , err);
			});
		};
		$scope.removeCertType = function(cert_type) {
			Auth.modifyCertification({type : "DELETE", certification : cert_type._id}).then(function(response){
				console.log("updated...",response);
				AlertMessage.success("Removed 1 " + cert_type.name + " from your profile", {duration : 4000});
				$scope.trainer = response;
			});
		};
		$scope.userHasCertType = function(cert, cert_type) {
			if(!$scope.trainer.certs) {
				console.log("User has no certs");
				return false;
			}
			if(!$scope.trainer.certs[cert.name]){
				console.log("User has no cert types for: ", cert.name);
				return false;
			}
			for(var i = 0; i < $scope.trainer.certs[cert.name].length; i++) {
				if($scope.trainer.certs[cert.name][i]._id == cert_type._id) {
					console.log("TRUE");
					return true;
				}
			}
			console.log("Dead end");
			return false;
		}
		$scope.userHasCert = function(cert) {
			if(!$scope.trainer.certs || !$scope.trainer.certs[cert.name]) {
				console.log("User has no certs");
				return false;
			}
			console.log("Does user have cert: ", cert, "?", $scope.trainer.certs[cert.name]);
			return $scope.trainer.certs[cert.name].length;
		};
		$scope.$on('$destroy', function () {
			socket.unsyncUpdates('trainer');
			socket.unsync.user('trainer', $scope.trainer);
		});
	});
});
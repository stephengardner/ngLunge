lungeApp.controller("CertificationsController", function(socket, Auth, Certification, $http, $scope){
	Auth.isLoggedInAsync(function(){
		$scope.trainer = Auth.getCurrentUser();
		socket.sync.user('trainer', $scope.trainer,  function(event, newTrainer){
			console.log("in sync.user callback, syncing trainer:", newTrainer);
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
			}).catch(function(err){
				console.log("ERROR ADDING CERT:" , err);
			});
		};
		$scope.removeCertType = function(cert_type) {
			Auth.modifyCertification({type : "DELETE", certification : cert_type._id}).then(function(response){
				console.log("updated...",response);
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
			var cert_found = false;
			if(!$scope.trainer.certs || !$scope.trainer.certs[cert.name]) {
				console.log("User has no certs");
				return false;
			}
			console.log("Does user have cert: ", cert, "?", $scope.trainer.certs[cert.name]);
			return $scope.trainer.certs[cert.name].length;
		};

		/*
		 watcch is also optional, but syncing via sockets does the job and might actually be less expensive
		 $scope.$watch(function(){ return Auth.getCurrentUser();}, function(something){
		 console.log("SOMETHING WAS:", something);
		 $scope.trainer = Auth.getCurrentUser();
		 });
		 */
		socket.syncCurrentUser('trainer', function(event, newTrainer){
			$scope.trainer = newTrainer;
		});
	});



	$scope.$on('$destroy', function () {
		socket.unsyncUpdates('trainer');
	});
});
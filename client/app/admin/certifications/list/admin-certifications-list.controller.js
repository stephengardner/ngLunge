
lungeApp.controller("AdminCertificationsListController", function(Certification, $http, $scope, socket){
	$scope.certifications = Certification.query();
	console.log("CERTS:", $scope.certifications);
	$scope.addingTo = {
	};

	$scope.newCert = {
		visibile : false,
		data : {},
		toggleVisible : function(){
			this.visible = !this.visible;
		},
		reset : function(){
			this.visible = false;
			this.data = {};
		}
	}
	$scope.newCertType = {
		showMoreInfo : false,
		data : {},
		toggleMoreInfo : function(){
			this.showMoreInfo = !this.showMoreInfo;
		}
	};

	$scope.addingTypeName = {};
	$scope.createCert = function(newCert) {
		Certification.save(newCert.data, function(response){
			$scope.certifications.push(response.cert);
			$scope.newCert.reset();
			console.log("created and pushed a new cert from the resource response:", response);
		});
	};
	$scope.certAddType = function(cert){
		Certification.addType({id : cert._id}, {types : [$scope.newCertType.data]}, function(response){
			console.log("updated cert:",response);
			for(var i = 0; i < $scope.certifications.length; i++){
				if($scope.certifications[i]._id == response._id){
					console.log("OK setting new cert:", response);
					$scope.certifications[i] = response;
				}
			}
		});

	};
	$scope.deleteCert = function(cert) {
		Certification.remove({id : cert._id}, function(response){
			if(response) {
				for(var i = 0; i < $scope.certifications.length; i++){
					if($scope.certifications[i]._id == cert._id){
						$scope.certifications.splice(i, 1);
					}
				}
			}
			console.log("Removed a certification and got response from server:", response);
		});
	};

	$scope.deleteCertType = function(cert, type, index) {
		Certification.removeType({id : cert._id}, {types : [{_id : type._id}]}, function(response){
			if(response) {
				cert.types.splice(index, 1);
			}
			console.log("deleted cert type... response:",response);
		}, function(err){
			console.log("err on deleting cert type:",err);
		});
	};

	$scope.toggleNewSubType = function(cert, index) {
		$scope.addingTo[index] = !$scope.addingTo[index];
	}
});
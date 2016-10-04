
lungeApp.controller("TrainerAccountVerifyCertificationsModalController",
	function($mdDialog,
	         TrainerCertifications,
	         FullMetalSocket,
	         CertificationOrganization,
	         TrainerFactory,
	         AlertMessage,
	         Auth,
	         Certification,
	         $http,
	         $scope,
	         Upload,
	         $timeout,
	         $rootScope,
	         FormControl,
	         certificationV2){
		$scope.trainerFactory = TrainerFactory;
		$scope.certificationV2 = certificationV2;
		$scope.cancel = $mdDialog.cancel;
		$scope.formControl = FormControl;
		$scope.fileModel ={};
		$scope.errorFiles = [];
		$scope.maxSize = 5; // Megabytes
		// note - AlertMessage will not work when modals are open because modals have a higher z-index.
		// AlertMessage is attached to the navbar and we don't want the navbar popping over the modal
		// So we'll have to show something specific to the modal window, or alter the AlertMessage to display
		// FIXED at the top of the screen, for instances when the modal is open.
		// Actually, an option for a fixed alertMessage sounds great!


		$scope.activeFiles = [];
		
		$scope.fileChanged = function(form, files, file) {
			console.log("FILES:", files, " FILE: ", file);
			console.log("ERR?:", $scope.errorFiles);
			FormControl.removeMongooseError(form, 'file');
			if(file && file.name) {
				$scope.fileModel.name = file.name;
			}
		};
		
		$scope.fileSelected = function(form, files, file) {
			console.log("I SELECTED ONE!", file);
			$scope.fileModel.file = file;
			$scope.fileModel.name = file.name;
		};
		
		$scope.toggleDeleteFile = function(file) {
			file.deleting = !file.deleting;
		};

		$scope.numActiveFiles = function() {
			return $scope.activeFiles.length;	
		};
		
		$scope.deleteFile = function(form, file) {
			var httpParams = {
				method : 'DELETE',
				url : '/api/trainers/' + $scope.trainerFactory.trainer._id + '/certification-file/' + file._id
			};
			$rootScope.globalAjax.busy = $http(httpParams).then(function(response, headers){
				FormControl.removeMongooseError(form, 'file');
				AlertMessage.success("\"" + file.user_desired_name + "\" removed successfully.");
				console.log("THE RESPONSE:", response);
				$scope.certificationV2 = response.data;
				getActiveFiles();
				$scope.toggleDeleteFile(file);
			}).catch(function(err){
				AlertMessage.error('Woops, something went wrong.  Please try again later.');
				FormControl.removeMongooseError(form, 'file');
				console.log("Got error:", err);
				getActiveFiles();
				$scope.toggleDeleteFile(file);
			});
		};

		$scope.submitNewCertification = function(form) {
			if(!form.$valid) {
				console.log("invalid form:", form);
				return false;
			}
			var file = $scope.fileModel.file;
			var data = {
				trainer : { id : TrainerFactory.trainer.id, email : TrainerFactory.trainer.email },
				certificationV2 : $scope.certificationV2,
				filename: $scope.fileModel.name,
				file: file
			};
			console.log("Sending data:", data);
			$rootScope.globalAjax.busy = file.upload = Upload.upload({
				url: 'api/certification-types/verify',
				method : 'POST',
				data : data
				//file : file,
			});
			file.upload.then(function (response) {
				AlertMessage.success("\"" + $scope.fileModel.name + "\" added successfully.");
				$timeout(function () {
					file.result = response.data;
					console.log("THE RESPONSE:", response);
					$scope.certificationV2 = response.data;
					$scope.toggleChooseFile(form);
					getActiveFiles();
				});
			}, function (response) {
				getActiveFiles();
				console.log("The response:", response);
				FormControl.parseValidationErrors(form, response);
				if (response.status > 0)
					$scope.errorMsg = response.status + ': ' + response.data;
				console.log("The $SCOPE.trainerFactory.trainer:", $scope.trainerFactory.trainer);
				console.log("The ACTUAL TrainerFactory.trainer:", TrainerFactory.trainer);
			}, function (evt) {
				// Math.min is to fix IE which reports 200% sometimes
				file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
			});
		};

		$scope.toggleChooseFile = function(form){
			if($scope.fileModel.file && $scope.fileModel.file.name) {
				$scope.fileModel.file = undefined;
				FormControl.removeMongooseError(form, 'file');
			}
			else {
				$("#file").trigger('click');
			}
		};

		function getActiveFiles() {
			console.log("[Trainer Account Vertifications Verify Modal Controller] get active files");
			var certificationV2 = $scope.certificationV2,
				i,
				returnArray = [],
				certificationV2AtIndex,
				isActive
				;
			for(i = 0; i < certificationV2.verification.files.length; i++) {
				certificationV2AtIndex = certificationV2.verification.files[i];
				isActive = certificationV2AtIndex.active;
				if(isActive) {
					returnArray.push(certificationV2AtIndex);
				}
			}
			$scope.activeFiles = returnArray;
			return returnArray;
		}

		getActiveFiles();
	});
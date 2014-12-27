lungeApp.controller("TrainerHomeController", function(ScreenSize, $http, $scope, socket){
	$scope.page = 1;
	$scope.trainersPerPage = 4;
	$scope.pagination = {
		active : true,
		page : 1
	};
	$scope.trainersInHomeLength = 0;
	$scope.screenSize = ScreenSize;
	$scope.$watch('screenSize.size', function(){
		if($scope.screenSize.sizeInt <= 1){
			$scope.trainersPerPage = 3;
		}
		else {
			$scope.trainersPerPage = 4;
		}
	});
	$http.get('/api/trainers').success(function(trainers) {
		$scope.trainers = trainers;
		console.log(trainers);
		socket.syncUpdates('trainer', $scope.trainers);
	});
	$scope.pageIncrement = function(number){
		function checkPage() {
			if($scope.page > 4) {
				$scope.pagination.finished = true;
			}
			else {
				$scope.pagination.finished = false;
			}
		}
		if(number > 0) {
			var trainersNeededToRotate = ($scope.page + 1) * $scope.trainersPerPage;
			for(var i = 0; i < $scope.trainers; i++){
				if($scope.trainers[i]['type'] == 'in-home')
					$scope.trainersInHomeLength++;
			}
			if($scope.trainersInHomeLength < trainersNeededToRotate){
				//console.log("CategoryHomeController pageIncrement(): had ", $scope.trainers['in-home'].length, " trainers, but needed ", trainersNeededToRotate, " so we're GETting more trainers...");
				$http.get('/api/trainers/type/all').success(function(trainers) {
					for(var i = 0; i < trainers['in-home'].length; i++){
						$scope.trainers.push(trainers['in-home'][i]);
					}
					$scope.page++;
					checkPage();
				});
			}
			else {
				$scope.page+=number;
				checkPage();
			}
		}
		else {
			$scope.page+=number;
			checkPage();
		}
	}
});
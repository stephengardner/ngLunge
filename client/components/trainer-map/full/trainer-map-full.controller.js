lungeApp.controller("TrainerMapFullController", function(TrainerFactory, Sync,
                                                                $document,
                                                                $anchorScroll,
                                                                $interval,
                                                                trainerMap,
                                                                trainerMapUIOverlays,
                                                                uiGmapGoogleMapApi,
                                                                uiGmapIsReady,
                                                                snazzyStyleBlue,
                                                                FormControl,
                                                                $q,
                                                                $timeout,
                                                                Auth,
                                                                $compile,
                                                                AlertMessage,
                                                                Geocoder,
                                                                $scope){

	$scope.errors = FormControl.errors;
	$scope.removeMongooseError = FormControl.removeMongooseError;
	$scope.trainerFactory = TrainerFactory;


});
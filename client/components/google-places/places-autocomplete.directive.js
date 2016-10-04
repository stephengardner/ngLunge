myApp
	.directive('placesAutocomplete', ['Geocoder', function(Geocoder) {
		return {
			templateUrl: 'components/google-places/places-autocomplete.partial.html',
			restrict: 'E',
			replace: true,
			scope: {
				'ngModel': '=',
				'form' : '=',
				'removeMongooseError' : '=?',
				'ngChange' : '&?'
			},
			controller: ['$scope', '$q', function($scope, $q) {
				if (!google || !google.maps) {
					throw new Error('Google Maps JS library is not loaded!');
				} else if (!google.maps.places) {
					throw new Error('Google Maps JS library does not have the Places module');
				}
				var autocompleteService = new google.maps.places.AutocompleteService(document.createElement('input'));
				var map = new google.maps.Map(document.createElement('div'));
				var placeService = new google.maps.places.PlacesService(map);
				$scope.ngModel = {};


				/**
				 * @ngdoc function
				 * @name getResults
				 * @description
				 *
				 * Helper function that accepts an input string
				 * and fetches the relevant location suggestions
				 *
				 * This wraps the Google Places Autocomplete Api
				 * in a promise.
				 *
				 * Refer: https://developers.google.com/maps/documentation/javascript/places-autocomplete#place_autocomplete_service
				 */
				var getResults = function(address) {
					return new $q(function(resolve, reject){
						autocompleteService.getQueryPredictions({
							input: address
						}, function(data) {
							resolve(data);
						}, reject);
					})
				};

				/**
				 * @ngdoc function
				 * @name getDetails
				 * @description
				 * Helper function that accepts a place and fetches
				 * more information about the place. This is necessary
				 * to determine the latitude and longitude of the place.
				 *
				 * This wraps the Google Places Details Api in a promise.
				 *
				 * Refer: https://developers.google.com/maps/documentation/javascript/places#place_details_requests
				 */
				var getDetails = function(place) {
					return new $q(function(resolve, reject){
						placeService.getDetails({
							'placeId': place.place_id
						}, function(details) {
							resolve(details);
						}, reject);
					})
				};

				$scope.search = function(input) {
					// console.log("Scope form is:", $scope.form);
					$scope.form['location'].$setValidity('mongoose', true);
					if($scope.ngChange) {
						$scope.ngChange();
					}
					if (!input) {
						return;
					}
					return getResults(input).then(function(places) {
						if(!places) return [];
						return places;
					});
				};
				/**
				 * @ngdoc function
				 * @name getLatLng
				 * @description
				 * Updates the scope ngModel variable with details of the selected place.
				 * The latitude, longitude and name of the place are made available.
				 *
				 * This function is called every time a location is selected from among
				 * the suggestions.
				 */
				$scope.getLatLng = function(place) {
					if (!place) {
						$scope.ngModel = {};
						return;
					}
					getDetails(place).then(function(details) {
						console.log("Details are:", details);
						var lungeLocation = Geocoder.createLocationFromAPIResponse(details);
						$scope.ngModel = lungeLocation;
					});
				}
			}]
		};
	}]);
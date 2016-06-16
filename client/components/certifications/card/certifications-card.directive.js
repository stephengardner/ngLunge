myApp.directive('certificationsCard', function(){
	return {
		restrict : 'AE',
		scope : {
			editable : '@'
		},
		templateUrl : 'components/certifications/card/certifications-card.partial.html'
	}
})
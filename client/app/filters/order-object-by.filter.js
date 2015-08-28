lungeApp.filter('orderObjectBy', function(){
	return function(input, attribute) {
		if (!angular.isObject(input)) return input;

		var array = [];
		for(var objectKey in input) {
			array.push(input[objectKey]);
		}

		array.sort(function(a, b){
			a = (a[attribute]);
			b = (b[attribute]);
			return b - a;
		});
		return array;
	}
});
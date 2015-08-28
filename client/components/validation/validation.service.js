myApp.factory("Validation", function(){
	var Validation = {
		name : function(value){
			return value && value.length > 1;
		},
		bio : function(value) {
			return !value || value.length < 300;
		},
		city : function(value) {
			return value && value.length > 2;
		},
		state : function(value) {
			return value == "DC" || value == "MD" || value == "VA";
		},
		zipcode : function(value) {
			return /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(value);
		}
	};
	return Validation;
})
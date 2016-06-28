myApp.directive("privacyPopover", function(){
	return {
		restrict :'AE',
		link : function(scope, elem, attrs) {
			elem.bind("click", function(e){
				console.log("ATTRS:", attrs);
				if(attrs.active != 'false')
					scope.togglePopover(e, attrs.modelToEdit)
			});
		}
	}
})
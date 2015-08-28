lungeApp.filter('CertificationQuery', function(){
	// function that's invoked each time Angular runs $digest()
	// pass in `item` which is the single Object we'll manipulate
	return function (items, something) {
		var newItems = [];
		var regex = new RegExp(something, "i");
		for(var i = 0; items && i < items.length; i++) {
			//console.log(items[i]);
			if(regex.test(items[i].name)){
				//console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", items[i]);
				newItems.push(items[i]);
			}
			//console.log("===============");
		}
		//console.log(items, something);
		// return the current `item`, but call `toUpperCase()` on it
		return newItems;
	};
});
lungeApp.filter('CertificationAddedFilter', function(){
	// check if the certification was added or not added based on the param addedFlag
	return function (items, trainer, buttonAddedType) {
		var newItems = [];
		for(var i = 0; i < items.length; i++) {
			if(buttonAddedType == 'added') {
				if(trainer.certs[items[i].name]) {
					newItems.push(items[i]);
				}
			}
			else if (buttonAddedType == 'not-added'){
				if(!trainer.certs[items[i].name]) {
					newItems.push(items[i]);
				}
			}
			else {
				newItems.push(items[i]);
			}
		}
		return newItems;
	};
});
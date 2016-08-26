angular.module("socialMeta").factory("SocialMeta", function(){
	var SocialMeta = {
		tags : {
			type : {
				types : [{ prefix : 'og', name : "property"}],
				extrasOnly : true,
				content : "website"
			},
			title : {
				types : [{ prefix : 'og', name : "property"}],
				extrasOnly : true,
				content : ""
			},
			description : {
				types : [{ prefix : 'og', name : "property"}],
				content : ""
			},
			image : {
				types : [{ prefix : 'og', name : "property"}],
				extrasOnly : true,
				content : ""
			},
			url : {
				types : [{ prefix : 'og', name : "property"}],
				extrasOnly : true,
				content : ""
			}
		},
		empty : function(tag) {
			SocialMeta.tags[tag].content = "";
		},
		_parseInputObj : function(tag, opt_replaceAll) {
			var returnObj = angular.copy(SocialMeta.tags);
			angular.forEach(returnObj, function(attributes, key) {
				if(opt_replaceAll && !tag[key] && key != "url") {
					returnObj[key].content = "";//empty(key);
				}
				if (typeof tag[key] == "object") {
					returnObj[key] = angular.extend({}, returnObj[key], tag[key]);
				}
				else {
					if(tag[key]) {
						returnObj[key].content = tag[key];
					}
				}
			});
			return returnObj;
		},
		set : function(tag, value) {
			// set() : sets the content of a meta tag.
			// allows you to pass in an object of meta tag types so you don't have to continue calling .set()
			// note, if within the object is another object of meta properties, it will set those,
			// BUT they must have
			// been set initially by the SocialMeta module's .run function
			// (basically just make sure they're within the defaults up top before that .run is called)
			var inputObject = {};
			if(typeof tag != "object") {
				inputObject[tag] = {
					content : value
				}
			}
			else {
				inputObject = tag;
			}
			SocialMeta.tags = SocialMeta._parseInputObj(inputObject, 1);
			console.log("SocialMeta tags are now:", SocialMeta.tags);
		},
		// add() the cursory to set, but adds to the meta params without removing any
		add : function(tag, value) {
			var inputObject = {};
			if(typeof tag != "object") {
				inputObject[tag] = {
					content : value
				}
			}
			else {
				inputObject = tag;
			}
			SocialMeta.tags = SocialMeta._parseInputObj(inputObject)
		}
	}
	return SocialMeta;
});
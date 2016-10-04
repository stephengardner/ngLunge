angular.module("socialMeta", [])
	.run(function($timeout, $compile, $rootScope, SocialMeta, $location){
		$rootScope.SocialMeta = SocialMeta;

		$rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
			SocialMeta.add("url", $location.absUrl());
			if(toState.tags) {
				// console.log("setting social meta with: ", toState.tags);
				SocialMeta.set(toState.tags);
			}
		});

		var head = document.getElementsByTagName("head")[0];

		// Scan through the socialMeta factory and put the tag at the root of the page
		angular.forEach(SocialMeta.tags, function(tag, key){
			// console.log("tag is:", tag, " key is : ", key);
			if(tag.types && tag.types.length) {
				for(var i = 0; i < tag.types.length; i++) {
					generateMetaTag(tag, key, tag.types[i]);
				}
			}
			if(!tag.extrasOnly) {
				generateMetaTag(tag, key);
			}
		});

		// generate the metaTag using an ng-if
		function generateMetaTag(tag, key, opt_tagType) {
			opt_prefix = opt_tagType && opt_tagType.prefix ? opt_tagType.prefix + ":" : "";
			var propertyName = opt_tagType && opt_tagType.name ? opt_tagType.name : "name";

			var elementString = '<meta ';// name="' + opt_prefix + key + '" ';
				elementString += propertyName + '="' + opt_prefix + key + '" ';
			angular.forEach(tag, function(tagAttribute, tagKey){
				if(tagKey != "types") {
					elementString += tagKey + '="{{SocialMeta.tags[\'' + key + '\'][\'' + tagKey + '\']}}"';
				}
			})
			elementString += 'ng-if="SocialMeta.tags[\'' + key + '\'].content" >';
			var element = angular.element(elementString);
			head.appendChild(element[0]);

			if(key == "title") {
				elementString = '<title ng-bind-html="SocialMeta.tags[\'title\'][\'content\']"></title>';
				var element = angular.element(elementString);
				head.appendChild(element[0]);
			}
		}

	});
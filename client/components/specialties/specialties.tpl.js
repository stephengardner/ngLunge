
myApp.run(["$templateCache", function($templateCache) {
	var strVar = "";
	strVar += "        <a>";
	strVar += "            <span bind-html-unsafe=\"match.model.name | typeaheadHighlight:query\"><\/span>";
	strVar += "        <\/a>";
	$templateCache.put("custom-ui-specialties.tpl.html", strVar);
}]);
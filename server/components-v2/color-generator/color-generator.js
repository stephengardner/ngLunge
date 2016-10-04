var randomColor = require('randomcolor')
;
module.exports = function(options, imports, register) {
	var ColorGenerator = {
		generate : function(){
			return randomColor({
				luminosity: 'dark',
				hue: 'random'
			});
		}
	};
	register(null, {
		colorGenerator : ColorGenerator
	})
};
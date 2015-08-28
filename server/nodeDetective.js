var detective = require('detective');
var fs = require('fs');

var src = fs.readFileSync(__dirname + '/app.js');
var requires = detective(src, {nodes : true});
console.dir(requires);
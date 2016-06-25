var async = require('async'),
	expect = require('chai').expect,
	fs = require('fs')
;

module.exports = function setup(options, imports, register) {
	var certificationRemoveLocalFile = {
		remove : function(req, res){
			return new Promise(function(resolve, reject) {
				expect(req).to.have.property('file');
				expect(req.file).to.have.property('path');
				fs.unlink(req.file.path, function(err, response){
					if(err) return reject(err);
					console.log("Successfully removed file at path:", req.file.path);
					return resolve(response);
				})
			})
		}
	};
	register(null, {
		certificationRemoveLocalFile : certificationRemoveLocalFile
	})
}
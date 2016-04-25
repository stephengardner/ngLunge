module.exports = function setup(options, imports, register) {
	var exports = {};
	var CertificationOrganizationModel = imports.certificationOrganizationModel;
	var io = imports.socket;

	CertificationOrganizationModel.schema.post('save', function (doc) {
		CertificationOrganizationModel.findById(doc._id)
			.populate('certifcationTypes')
			.exec(function(err, newdoc){
				if(err) return console.log(err);
				console.log("Emmitting: certificationOrganization:saved which means a specific certificationOrganization was updated now!");
				// emit to all sockets that are on in the room for this trainer, currently they enter the room when they're on the profile page
				io.sockets.in('certificationOrganization').emit("certificationOrganization:saved", newdoc);
			})
	});

	CertificationOrganizationModel.schema.post('remove', function (doc) {
		console.log("Emmitting: certificationType:removed which means a specific certificationOrganization was updated now!");
		// emit to all sockets that are on in the room for this trainer, currently they enter the room when they're on the profile page
		io.sockets.in('certificationOrganization').emit("certificationOrganization:removed", doc);
	});

	var doRegister = function(socket) {}

	register(null, {
		certificationOrganizationSocket : {
			register : doRegister
		}
	})

}
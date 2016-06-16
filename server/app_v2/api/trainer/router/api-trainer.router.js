var express = require("express");

module.exports = function setup(options, imports, register){
	var router = express.Router();
	var controller = imports.apiTrainerController;
	var auth = imports.auth;
	var bruteforce = imports.bruteforce;
	//router.put('/:id/profilePicture', bruteforce.prevent, auth.isTrainerMe(), controller.changeProfilePicture);
	//router.put('/:id/certification', auth.isTrainerMe(), controller.modifyCertification);
//router.delete('/:id/certification', controller.modifyCertification);
	router.get('/me', auth.isTrainerAuthenticated(), controller.me);
	//router.post('/test', controller.create);
	router.get('/', controller.index);
	router.get('/:id', auth.isTrainerMe(), controller.show);
	router.get('/byUrlName/:urlName', auth.isTrainerMe(), controller.show);
	router.put('/:id', /*bruteforce.prevent,*/ auth.authenticate(), auth.attachCorrectTrainerById(), controller.update, function(){ console.log("----------------------------------------OK_----------------");});
	router.patch('/:id', bruteforce.global.prevent, controller.update);
	router.delete('/:id', bruteforce.global.prevent, controller.destroy);
	router.get('/type/:type', controller.showType);
	router.delete('/:id/certification-file/:file_id',
		auth.isTrainerAuthenticated(),
		auth.isTrainerMe(),
		controller.deleteCertificationFile);
	router.post('/:id/profile-picture/local',
		bruteforce.global.prevent,
		auth.isTrainerAuthenticated(),
		auth.isTrainerMe(),
		controller.uploadProfilePicture);
	router.post('/:id/profile-picture/s3',
		bruteforce.global.prevent,
		auth.isTrainerAuthenticated(),
		auth.isTrainerMe(),
		controller.uploadProfilePictureS3);
	// returns the trainer during password resetting so the angular app has that trainer in its state for submission
	router.get('/password-reset/authenticate/:authenticationHash', controller.passwordResetAuthenticate);

	router.post('/', controller.create);
	router.post('/register', controller.create);
	
	// password reset routes
	// bruteforce built-in controller
	router.post('/password-reset/submit', controller.passwordResetSubmit);
	// todo authenticate this route, maybe add :id in front
	router.post('/password-reset/confirm', controller.passwordResetConfirm);
	
	// contact inquiry from profile page
	// bruteforce built-in controller
	router.post('/:id/contact-inquiries', controller.sendEmail);

	
	router.get('/send_email/:email', bruteforce.global.prevent, controller.sendEmail);
	router.put('/:id/changeEmail', auth.isTrainerAuthenticated(), auth.isTrainerMe(), controller.changeEmail);
	router.put('/:id/addLocation', auth.isTrainerAuthenticated(), auth.isTrainerMe(), controller.addLocation);
	router.put('/:id/removeLocation', auth.isTrainerAuthenticated(), auth.isTrainerMe(), controller.removeLocation);
	register(null, {
		apiTrainerRouter : router
	})
}

//module.exports = router;
'use strict';

var express = require('express');


module.exports = function createRouter(app){
	var router = express.Router();
	var controller = require('./trainer.controller')(app);
	var auth = require('../../auth/auth.service')(app);
	router.put('/:id/profilePicture', app.bruteforce.prevent, auth.isTrainerMe(), controller.changeProfilePicture);
	//router.put('/:id/certification', auth.isTrainerMe(), controller.modifyCertification);
//router.delete('/:id/certification', controller.modifyCertification);
	router.get('/me', auth.isTrainerAuthenticated(), controller.me);
	//router.post('/test', controller.create);
	router.get('/', controller.index);
	router.get('/:id', auth.isTrainerMe(), controller.show);
	router.get('/byUrlName/:urlName', auth.isTrainerMe(), controller.show);
	router.put('/:id', app.bruteforce.prevent, auth.authenticate(), auth.attachCorrectTrainerById(), controller.update, function(){ console.log("----------------------------------------OK_----------------");});
	router.patch('/:id', app.bruteforce.prevent, controller.update);
	router.delete('/:id', app.bruteforce.prevent, controller.destroy);
	router.get('/type/:type', controller.showType);
	router.post('/', controller.create);
	router.get('/send_email/:email', app.bruteforce.prevent, controller.sendEmail);
	router.put('/:id/changeEmail', auth.isTrainerAuthenticated(), auth.isTrainerMe(), controller.changeEmail);
	router.put('/:id/addLocation', auth.isTrainerAuthenticated(), auth.isTrainerMe(), controller.addLocation);
	router.put('/:id/removeLocation', auth.isTrainerAuthenticated(), auth.isTrainerMe(), controller.removeLocation);
	return router;
}

//module.exports = router;
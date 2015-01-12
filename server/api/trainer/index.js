'use strict';

var express = require('express');
var controller = require('./trainer.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.put('/:id/profilePicture', auth.isTrainerMe(), controller.changeProfilePicture);
router.put('/:id/certification', auth.isTrainerMe(), controller.modifyCertification);
//router.delete('/:id/certification', controller.modifyCertification);
router.get('/me', auth.isTrainerAuthenticated(), controller.me);
router.post('/test', controller.create);
router.get('/', controller.index);
router.get('/:id', auth.isTrainerMe(), controller.show);
router.get('/byUrlName/:urlName', auth.isTrainerMe(), controller.show);
router.put('/:id', auth.isTrainerAuthenticated(), auth.isTrainerMe(), controller.update, function(){ console.log("----------------------------------------OK_----------------");});
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);
router.get('/type/:type', controller.showType);
router.post('/', controller.create);
router.get('/send_email/:email', controller.sendEmail);
router.put('/:id/changeEmail', auth.isTrainerAuthenticated(), auth.isTrainerMe(), controller.changeEmail);
router.put('/:id/addLocation', auth.isTrainerAuthenticated(), auth.isTrainerMe(), controller.addLocation);

module.exports = router;
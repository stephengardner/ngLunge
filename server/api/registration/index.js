'use strict';

var express = require('express');
var controller = require('./registration.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.put('/:id/submit_password', auth.isValidRegistration(), controller.submitPassword);
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
//router.get('/send_email', controller.sendEmail);
router.get('/test/:email', controller.test);
router.get('/:id/authenticate', controller.validateEmail);

module.exports = router;
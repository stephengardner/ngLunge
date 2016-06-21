'use strict';

var express = require('express');
var controller = require('./trainer.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/me', auth.isAuthenticated(), controller.me);
router.post('/test', controller.create);
router.get('/', controller.index);
router.get('/:id', controller.show);
router.get('/type/:type', controller.showType);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);
router.get('/send_email/:email', controller.sendEmail);

module.exports = router;
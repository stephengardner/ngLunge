'use strict';

var express = require('express');
var controller = require('./certification.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.put('/:id', controller.update);
router.put('/:id/addType', controller.addType);
router.post('/:id/removeType', controller.removeType);
router.post('/', controller.create);
router.delete('/:id', controller.destroy);
module.exports = router;
'use strict';

var express = require('express');
var controller = require('./aws.controller');

var router = express.Router();
/*
 router.get('/policy', controller.getS3Policy);
 router.post('/upload', controller.uploadToFS);
 router.put('/upload', controller.uploadToFS);
 */
router.post('/upload', controller.upload);
router.put('/upload', controller.upload);
router.post('/crop', controller.crop);

module.exports = router;

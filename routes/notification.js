var express = require('express');
var router = express.Router();
var notificationController = require('../controllers/notificationController');

router.put('/:id/read', notificationController.updateNotification);

module.exports = router;

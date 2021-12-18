var express = require('express');
var router = express.Router();
var groupController = require('../controllers/confirmedGroupController');

router.put('/:id', groupController.updateConfirmedGroup);

module.exports = router;

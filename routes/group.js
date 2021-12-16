var express = require('express');
var router = express.Router();
var groupController = require('../controllers/groupController');

router.put('/:id', groupController.updateGroup);

router.get('/:id', groupController.updateGroup);

module.exports = router;

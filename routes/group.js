var express = require('express');
var router = express.Router();
var groupController = require('../controllers/groupController');

router.put('/:id', groupController.updateGroup);

router.post('/:id/request', groupController.updateVetGroup)

router.put('/:id/requests/:reqid', groupController.updateRequest)

router.put('/:id/close', groupController.closeVetGroup)


module.exports = router;

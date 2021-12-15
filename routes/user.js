const User = require('../models/user')

var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController');

/* Add new user to database */
router.get('/:id', userController.getUser);

router.put('/:id', userController.updateUser);

module.exports = router;

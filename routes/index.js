const User = require('../models/user')

var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController');

/* Add new user to database */
router.post('/signup', userController.addUser);

module.exports = router;

var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.json({text: 'API is working properly'});
});

module.exports = router;
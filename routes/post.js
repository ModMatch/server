var express = require('express');
var router = express.Router();
var postController = require('../controllers/postController');

router.get('/', postController.showPosts);

router.post('/new', postController.addPost);

router.delete('/:id', postController.deletePost);

router.put('/:id', postController.updatePost);

router.get('/:id', postController.getPost);

module.exports = router;

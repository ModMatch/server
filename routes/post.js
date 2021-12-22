var express = require('express');
var router = express.Router();
var postController = require('../controllers/postController');

router.get('/', postController.showPosts);

router.post('/new', postController.addPost);
  
router.get('/search', postController.showPostsWithQuery);

router.delete('/:id', postController.deletePost);

router.put('/:id', postController.updatePost);

router.get('/:id', postController.getPost);

router.get('/tags/:tagname', postController.showPostsWithTag);

router.get('/:id/viewapp', postController.getPostApp);

router.post('/:id', postController.addComment);

router.delete('/:id/:commentid', postController.deleteComment);

router.put('/:id/:commentid', postController.updateComment);

module.exports = router;

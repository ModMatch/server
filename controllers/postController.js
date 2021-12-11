const Post = require('../models/post')
const { body,validationResult } = require("express-validator");
const passport = require("passport");

exports.addPost = [
  passport.authenticate('jwt', { session: false }), 
  body('title').trim().escape(),
  body('description').trim().escape(),
  async (req, res, next) => {

    var post = new Post({
      title: req.body.title,
      user:req.body.user,
      description: req.body.description,
      name: req.body.name
    })

    try {
      await post.save();
      return res.status(200).json("Post success!");
    } catch (err) {
      return next(err);
    }

  }
]

exports.showPosts = [
  passport.authenticate('jwt', { session: false }), 
  async (req, res, next) =>  {
    try {
      let posts = await Post.find().sort({date : -1}).exec();
      res.json({posts})
    } catch(err) {
      return next(err);
    }
  }
]

exports.deletePost = [
  passport.authenticate('jwt', { session: false }), 
  async (req, res, next) =>  {
    try {
     await Post.findByIdAndRemove(req.params.id).exec();
     res.status(200);
    } catch(err) {
      return next(err);
    }
  }
]

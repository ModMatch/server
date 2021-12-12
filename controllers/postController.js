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
      name: req.body.name,
      tag: req.body.tag
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
      return res.json({posts});
    } catch(err) {
      return next(err);
    }
  }
]

exports.getPost = [
  passport.authenticate('jwt', { session: false }), 
  async (req, res, next) =>  {
    try {
      let post = await Post.findById(req.params.id).exec();
      return res.json({post});
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
     return res.status(200);
    } catch(err) {
      return next(err);
    }
  }
]

exports.updatePost = [
  passport.authenticate('jwt', { session: false }), 
  async (req, res, next) =>  {
    try {
     await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      description: req.body.description,      
      tag: req.body.tag
     }).exec();
     return res.status(200);
    } catch(err) {
      return next(err);
    }
  }
]

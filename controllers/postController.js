const Post = require('../models/post');
const Comment = require('../models/comment');
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
      let post = await Post.findById(req.params.id).populate({path: "comments", options: { sort: { date: -1 } }}).exec();
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
      let post = await Post.findById(req.params.id).exec();
      post.comments.forEach(i => {
        Comment.findByIdAndRemove(i).exec();
      })
      await Post.findByIdAndRemove(req.params.id)
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

exports.addComment = [
  passport.authenticate('jwt', { session: false }), 
  body('description').trim().escape(),
  async (req, res, next) => {

    var comment = new Comment({
      user:req.body.user,
      description: req.body.description,
      name: req.body.name
    })

    try {
      await comment.save(async (err, c)=> {
        await Post.findByIdAndUpdate(req.params.id, {$push: { comments: c.id }}).exec();
      });
      return res.status(200).json("Comment success!");
    } catch (err) {
      return next(err);
    }

  }
]

exports.deleteComment = [
  passport.authenticate('jwt', { session: false }), 
  async (req, res, next) =>  {
    try {
     await Comment.findByIdAndRemove(req.params.commentid).exec();
     await Post.findByIdAndUpdate(req.params.id, {$pull: { comments: req.params.commentid}}).exec();
     return res.status(200);
    } catch(err) {
      return next(err);
    }
  }
]

exports.updateComment = [
  passport.authenticate('jwt', { session: false }), 
  async (req, res, next) =>  {
    try {
     await Comment.findByIdAndUpdate(req.params.commentid, {
      description: req.body.description,      
     }).exec();
     return res.status(200);
    } catch(err) {
      return next(err);
    }
  }
]
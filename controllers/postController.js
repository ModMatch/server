const Post = require('../models/post');
const Comment = require('../models/comment');
const Group = require('../models/group');
const VetGroup = require('../models/vetGroup');
const Request = require('../models/request');
const { body,validationResult } = require("express-validator");
const passport = require("passport");

exports.addPost = [
  passport.authenticate('jwt', { session: false }), 
  body('title').trim().escape(),
  body('description').trim().escape(),
  async (req, res, next) => {
    var group, post;
    if (req.body.vet) {
      group = new VetGroup({
        request: [],
        questions: req.body.questions
      });
      post = new Post({
        title: req.body.title,
        user:req.body.user,
        description: req.body.description,
        tag: req.body.tag,
        group: group._id,
        onModel: "VetGroup"
      });
    } else {
      group = new Group({
        users: [req.body.user],
        size: parseInt(req.body.size) + 1,
      });
      post = new Post({
        title: req.body.title,
        user:req.body.user,
        description: req.body.description,
        tag: req.body.tag,
        group: group._id,
        onModel: "Group"
      });
    }

    try {
      await group.save();
      await post.save()
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
      let posts = await Post.find({pending: true}).sort({date : -1})
      .populate('author', '-password -email')
      .exec();
      return res.json({posts});
    } catch(err) {
      return next(err);
    }
  }
]

exports.showPostsWithTag = [
  passport.authenticate('jwt', { session: false }), 
  async (req, res, next) =>  {
    try {
      let posts = await Post.find({pending: true,  tag: req.params.tagname}).sort({date : -1})
      .populate('author', '-password -email')
      .exec();
      return res.json({posts});
    } catch(err) {
      return next(err);
    }
  }
]

exports.showPostsWithQuery = [
  passport.authenticate('jwt', { session: false }), 
  async (req, res, next) =>  {
    try {
      let posts = await Post.find({pending: true,  tag: { $regex: new RegExp('.*' + req.query.q + '.*'), $options: 'i' }}).sort({date : -1})
      .populate('author', '-password -email')
      .exec();
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
      let post = await Post.findById(req.params.id)
      .populate({
        path: "comments", 
        options: { sort: { date: -1 } },
        populate: {path: "commenter", select: "-password -email"}
      })
      .populate('author', '-password -email')
      .populate('group');
      if (post.onModel === 'VetGroup') {
        post = await Post.findById(req.params.id)
          .populate({
            path: "comments", 
            options: { sort: { date: -1 } },
            populate: {path: "commenter", select: "-password -email"}
          })
          .populate('author', '-password -email')
          .populate({
            path: 'group',
            populate: {path: "requests"}
          })
      }
      return res.json({post});
    } catch(err) {
      return next(err);
    }
  }
]

exports.getPostApp = [
  passport.authenticate('jwt', { session: false }), 
  async (req, res, next) =>  {
    try {
      let post = await Post.findById(req.params.id)
        .populate({
          path: 'group',
          populate: {path: "requests"}
        })
      if (String(req.user._id) !== String(post.user)) {
        return res.status(401).json("Forbidden");
      }
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
      if (post.onModel === 'VetGroup') {
        let group = await VetGroup.findById(post.group);
        group.requests.forEach(i => {
          Request.findByIdAndRemove(i).exec();
        })
        await VetGroup.findByIdAndRemove(post.group)
      } else {
        await Group.findByIdAndRemove(post.group);
      }
      await Post.findByIdAndRemove(req.params.id);
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
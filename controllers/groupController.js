const Post = require('../models/post');
const Comment = require('../models/comment');
const Group = require('../models/group');
const ConfirmedGroup = require('../models/confirmedGroup');
const { body,validationResult } = require("express-validator");
const passport = require("passport");

// updates group after request for joining is submitted
exports.updateGroup = [
  passport.authenticate('jwt', { session: false }), 
  async (req, res, next) =>  {
    try {
      const updatedGroup = await Group.findByIdAndUpdate(req.params.id, {
        users: req.body.users
      }, {returnDocument : 'after'}).exec();
      if (updatedGroup.users.length == updatedGroup.size) {
        const post = await Post.findOneAndDelete({group : req.params.id}).exec();
        var confirmedGroup = new ConfirmedGroup({
          users: updatedGroup.users,
          title: post.title,
          description: post.description
        });
        await confirmedGroup.save();
        post.comments.forEach(i => {
          Comment.findByIdAndRemove(i).exec();
        })
        await Group.findByIdAndDelete(req.params.id).exec();
        return res.status(200).json({isFull: true, group: confirmedGroup});
      }
      return res.status(200).json({isFull : false});
    } catch(err) {
      return next(err);
    }
  }
]

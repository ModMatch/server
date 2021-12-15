const Post = require('../models/post');
const Comment = require('../models/comment');
const Group = require('../models/group');
const { body,validationResult } = require("express-validator");
const passport = require("passport");

exports.updateGroup = [
  passport.authenticate('jwt', { session: false }), 
  async (req, res, next) =>  {
    try {
      const updatedGroup = await Group.findByIdAndUpdate(req.params.id, {
        users: req.body.users
      }, {returnDocument : 'after'}).exec();
      if (updatedGroup.users.length == updatedGroup.size) {
        await Post.findOneAndUpdate({group : req.params.id}, {pending : false});
        return res.status(200).json({isFull: true, users: updatedGroup.users});
      }
      return res.status(200).json({isFull : false});
    } catch(err) {
      return next(err);
    }
  }
]

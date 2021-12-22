const Post = require('../models/post');
const Comment = require('../models/comment');
const Group = require('../models/group');
const ConfirmedGroup = require('../models/confirmedGroup');
const Request = require('../models/request')
const VetGroup = require('../models/vetGroup');
const User = require('../models/user');
const passport = require("passport");

// updates group after request for joining is submitted or to unapply
exports.updateGroup = [
  passport.authenticate('jwt', { session: false }), 
  async (req, res, next) =>  {
    try {
      if (req.body.vet) {
        await User.findByIdAndUpdate(req.body.userid, {
          $pull: {applied: req.body.postid}
        })
        const g = await VetGroup
          .findById(req.params.id)
          .populate('requests')
          .exec();
        for (let i = 0; i < g.requests.length; i++) {
          let r = g.requests[i];
          if (String(r.user) == String(req.body.userid)) {
            Request.findByIdAndDelete(r._id).exec();
            await VetGroup
            .findByIdAndUpdate(req.params.id, {
              $pull: {requests: r._id}
            })
            .exec();
            break;
          }
        }
        return res.status(200);
      }
      else {
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
          req.body.users.forEach(async u => {
            await User.findByIdAndUpdate(u, {
              $pull: {applied: req.body.postid}
            })
          })
          await Group.findByIdAndDelete(req.params.id).exec();
          return res.status(200).json({isFull: true, group: confirmedGroup});
        } else if (req.body.isJoin) {
          await User.findByIdAndUpdate(req.body.userid, {
            $push: {applied: req.body.postid}
          })
        } else {
          await User.findByIdAndUpdate(req.body.userid, {
            $pull: {applied: req.body.postid}
          })
        }
        return res.status(200).json({isFull : false});
      }
    } catch(err) {
      return next(err);
    }
  }
]

// Upon submit of application by user
exports.updateVetGroup = [
  passport.authenticate('jwt', { session: false }), 
  async (req, res, next) =>  {
    try {
      let request = new Request({
        user: req.body.id,
        responses: req.body.responses,
        approval: 'pending'
      });
      await request.save();
      await VetGroup.findByIdAndUpdate(req.params.id, {
        $push: {requests: request}
      });
      const a = await User.findByIdAndUpdate(req.body.id, {
        $push: {applied: req.body.postid}
      }, {returnDocument: "after"});
      console.log(a)
      return res.status(200);
    } catch(err) {
      return next(err);
    }
  }
]

// Approval/rejection of request by group owner
exports.updateRequest = [
  passport.authenticate('jwt', { session: false }), 
  async (req, res, next) =>  {
    try {
      await Request.findByIdAndUpdate(req.params.reqid, {
        approval: req.body.approval
      })
      return res.status(200);
    } catch(err) {
      return next(err);
    }
  }
]

exports.closeVetGroup = [
  passport.authenticate('jwt', { session: false }), 
  async (req, res, next) =>  {
    try {
      const post = await Post.findById(req.params.id)
      .populate({
        path: 'group',
        populate: {path: "requests"}
      });
      let userArr = [post.user._id];
      const group = post.group;
      group.requests.forEach(async r => {
        if (r.approval === 'true') {
          userArr.push(r.user);
        }
        await User.findByIdAndUpdate(r.user, {
          $pull: {applied: req.params.id}
        })
        Request.findByIdAndRemove(r._id).exec();
      })
      const confirmedGroup = new ConfirmedGroup({
        users: userArr,
        title: post.title,
        description: post.description
      })
      await confirmedGroup.save();
      post.comments.forEach(i => {
        Comment.findByIdAndRemove(i).exec();
      })
      VetGroup.findByIdAndRemove(group._id).exec();
      await Post.findByIdAndRemove(req.params.id).exec();
      return res.status(200);
    } catch(err) {
      return next(err);
    }
  }
]

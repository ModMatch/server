const ConfirmedGroup = require('../models/confirmedGroup');
const passport = require("passport");

exports.updateConfirmedGroup = [
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const id = req.body.userid;
      const group = await ConfirmedGroup.findByIdAndUpdate(req.params.id, {
        $pull: {
          users: id
        }
      }, {returnDocument : 'after'}).exec();
      if (group.users.length === 0) {
        await ConfirmedGroup.findByIdAndRemove(req.params.id);
      }
    } catch(err) {
      return next(err);
    }
  }
]
const Notification = require('../models/notification');
const passport = require("passport");

exports.updateNotification = [
  passport.authenticate('jwt', { session: false }), 
  async (req, res, next) =>  {
    try {
     await Notification.findByIdAndUpdate(req.params.id, {
        readStatus: req.body.readStatus,      
     }).exec();
     return res.status(200);
    } catch(err) {
      return next(err);
    }
  }
]
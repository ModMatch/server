const User = require('../models/user')
const Post = require('../models/post')
const { body,validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const passport = require("passport");
const confirmedGroup = require('../models/confirmedGroup');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

/* Add new user to database */
exports.addUser = [

  body('email').trim().escape().isEmail().matches(/.+(@u\.nus\.edu)$/).withMessage("Emails must end with @u.nus.edu"),
  body('password').isLength({min: 7}).withMessage("Password must be at least 7 characters long"),
  body('surname').trim().escape().isLength({ min: 1 }).withMessage('Surname must be specified.'),
  body('givenName').trim().escape().isLength({ min: 1 }).withMessage('Given name must be specified.'),
  async (req, res, next) => {

    const errors = validationResult(req);

    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      var user = new User({
        given_name: req.body.givenName,
        surname: req.body.surname,
        surname_first: req.body.surnameOrder,
        email: req.body.email,
        password: hashedPassword,
        temporarytoken: jwt.sign({email: req.body.email} , process.env.JWT_SECRET_KEY)
      })
    } catch(err) {
      return next(err);
    }

    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    
    try {
      const duplicateUser = await User.findOne({email: req.body.email}).exec();
      if (duplicateUser) {
        res.json({errors: [{msg:"Email already exists!"}]});
      }
    } catch(err) {
      return next(err); 
    }

    try {
      await user.save();
      const msg = {
        to: user.email,
        from: 'modmatchapp@gmail.com',
        subject: 'Thank for registering with ModMatch',
        text: `Click on this link to get verified now: http://localhost:3000/verify/${user._id}/${user.temporarytoken}`,
        html: `<strong>Click on <a href="http://localhost:3000/verify/${user._id}/${user.temporarytoken}">this</a> link to get verified now! </strong>`,
      }
      sgMail
        .send(msg)
        .then(() => {
          console.log('Email sent')
        })
        .catch((error) => {
          console.error(error)
        })
      res.status(200).json({success: true})
    } catch(err) {
      return next(err);
    }
  }
];

exports.verifyUser = async (req, res, next) => {
  const user = await User.findById(req.params.id).exec();
  const token = req.params.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!user || decoded.email !== user.email) {
      res.json({message: "There is something wrong with the link" });
      } else {
      user.temporarytoken = false;
      user.active = true;
      user.save();
      res.json({message: "You are successfully verified!"});
    }
  } catch(err) {
    return next(err);
  }
}

/* Logs in existing user */
exports.login = async (req, res, next)=> {
  try {
    let email = req.body.email;
    const existingUser = await User.findOne({ email }).exec();
    if (!existingUser) {
      return res.status(401).json({message: 'Invalid Email or Password.'});
    }
    const validPassword = await bcrypt.compare(req.body.password, existingUser.password);
    if (!validPassword) {
      return res.status(401).json({message: 'Invalid Email or Password.'});
    }
    if (!existingUser.active) {
      return res.status(401).json({message: 'Account has not been activated. Please check your email'});
    }
    const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY, {expiresIn: 3600});
    res.json({
        message: "Login success",
        token
    })
  } catch(err) {
    return next(err);
  }
}

/* Checks if user is authenticated for protected pages */
exports.getAuth = [ 
  passport.authenticate('jwt', { session: false }), 
  (req, res) => {
  return res.status(200).json({auth: true, name: req.user.name, id: req.user._id})}
];

exports.getUser = [
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
    let user;
    if (req.params.id == req.user._id) {
      user = req.user;
    } else {
      user = await User.findById(req.params.id, { password: 0 }).exec();
    }
    const posts = await Post.find({user: user._id}).populate('author','-password -email').sort({date : -1}).exec();
    return res.status(200).json({user, posts});
  }
]

exports.getUserGroups = [
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
    let user;
    if (req.params.id == req.user._id) {
      user = req.user;
    } else {
      return res.status(401);
    }
    const groups = await confirmedGroup.find({users: user._id}).populate('users','email').exec();
    return res.status(200).json({groups});
  }
]

exports.getUserNotifications = [
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
    let user;
    if (req.params.id == req.user._id) {
      user = req.user;
    } else {
      return res.status(401);
    }
    const notifs = await User.findById(user._id).populate('notifications').select('notifications  ').exec();
    return res.status(200).json({notifs});
  }
]

exports.getUserPendingGroups = [
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
    let user;
    if (req.params.id == req.user._id) {
      user = req.user;
    } else {
      return res.status(401);
    }
    const groups = await User.findById(user._id)
    .populate({
      path: 'applied',
      populate: {path: 'author', select: '-password -email'},
      options: { sort: { date: -1 } }
    }).exec();
    return res.status(200).json({groups});
  }
]

exports.updateUser = [
  passport.authenticate('jwt', { session: false }), 
  body('password').isLength({min: 7}).withMessage("Password must be at least 7 characters long"),
  body('surname').trim().escape().isLength({ min: 1 }).withMessage('Surname must be specified.'),
  body('givenName').trim().escape().isLength({ min: 1 }).withMessage('Given name must be specified.'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    try {
      await User.findByIdAndUpdate(req.user._id,{
        given_name: req.body.givenName,
        surname: req.body.surname,
        surname_first: req.body.surnameOrder,
        password: hashedPassword
      }).exec()
      return res.status(200).json({success: true});
    } catch (err) {
      return next(err);
    }
  }
]
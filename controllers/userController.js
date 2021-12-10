const User = require('../models/user')
const { body,validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const passport = require("passport");

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
        password: hashedPassword
      })
    } catch(err) {
      return next(err);
    }

    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
      return;
    }
    
    try {
      const duplicateUser = await User.findOne({email: req.body.email}).exec();
      if (duplicateUser) {
        res.json({errors: "Email already exists!"});
      }
    } catch(err) {
      return next(err); 
    }

    try {
      await user.save()
      res.json("Success!")
    } catch(err) {
      return next(err);
    }
  }
];

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
  return res.status(200).json({auth: true, user: req.user})}
];

const User = require('../models/user')

var express = require('express');

const { body,validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');

/* Add new user to database */
exports.addUser = [

  body('email').trim().escape().isEmail().matches(/.+(@u\.nus\.edu)$/).withMessage("Emails must end with @u.nus.edu"),
  body('password').escape().isLength({min: 7}).withMessage("Password must be at least 7 characters long"),
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
        res.json("Email already exists!");
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

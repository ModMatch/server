var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    given_name: {type: String, required: true, maxLength: 100},
    surname: {type: String, required: true, maxLength: 100},
    surname_first: {type: Boolean, required: true},
    email: {type: String, 
      required: true, 
      match: [/^\w+([\.-]?\w+)*@u.nus.edu$/, 'Email address must end with u.nus.edu'],
      trim: true,
      lowercase: true,
      unique: true}
  }
);

// Virtual for user's full name
UserSchema
.virtual('name')
.get(function () {
  var fullname = '';
  if (this.given_name && this.surname && this.surname_first) {
    fullname = this.surname + ' ' + this.given_name
  } else if (this.given_name && this.surname && !this.surname_first) {
    fullname = this.given_name + ' ' + this.surname
  } else if (!this.first_name || !this.family_name) {
    fullname = '';
  }
  return fullname;
});

// Virtual for user's URL
UserSchema
.virtual('url')
.get(function () {
  return '/user/' + this._id;
});

//Export model
module.exports = mongoose.model('User', UserSchema);

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var GroupSchema = new Schema(
  {
    users: [{type: Schema.Types.ObjectId, ref: 'User'}],
    description: {type: String, required: true},
    tag: {type: String, required: true},
    pending: {type: Boolean, default: true}
  }
);

// Virtual for group's URL
UserSchema
.virtual('url')
.get(function () {
  return '/group/' + this._id;
});

//Export model
module.exports = mongoose.model('Group', GroupSchema);

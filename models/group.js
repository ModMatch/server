var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var GroupSchema = new Schema(
  {
    users: [{type: Schema.Types.ObjectId, ref: 'User'}],
    size: {type: Number, default: 3}  
  }
);

// Virtual for group's URL
GroupSchema
.virtual('url')
.get(function () {
  return '/group/' + this._id;
});

//Export model
module.exports = mongoose.model('Group', GroupSchema);

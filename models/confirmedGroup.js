var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ConfirmedGroupSchema = new Schema(
  {
    users: [{type: Schema.Types.ObjectId, ref: 'User'}],
    title: {type: String, required: true},
    description: {type: String, required: true}
  }
);

// Virtual for group's URL
ConfirmedGroupSchema
.virtual('url')
.get(function () {
  return '/group/' + this._id;
});

//Export model
module.exports = mongoose.model('ConfirmedGroup', ConfirmedGroupSchema);

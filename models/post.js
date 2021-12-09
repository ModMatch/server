var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PostSchema = new Schema(
  {
    title: {type: String, required: true},
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    description: {type: String, required: true},
    date: {type: Date, default: Date.now},
  }
);

// Virtual for post's URL
PostSchema
.virtual('url')
.get(function () {
  return '/post/' + this._id;
});

//Export model
module.exports = mongoose.model('Post', PostSchema);
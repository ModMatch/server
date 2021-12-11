var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PostSchema = new Schema(
  {
    title: {type: String, required: true},
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    description: {type: String, required: true},
    date: {type: Date, default: Date.now},
    name: {type: String, required: true}
  }
);

// Virtual for post's URL
PostSchema
.virtual('url')
.get(function () {
  return '/post/' + this._id;
});

PostSchema.set('toObject', { virtuals: true });

//Export model
module.exports = mongoose.model('Post', PostSchema);
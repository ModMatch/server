var mongoose = require('mongoose');
const { DateTime } = require("luxon");

var Schema = mongoose.Schema;

var PostSchema = new Schema(
  {
    title: {type: String, required: true},
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    description: {type: String, required: true},
    date: {type: Date, default: Date.now},
    tag: {type: String, required: true},
    group: {type: Schema.Types.ObjectId, refPath: 'onModel', required: true},
    onModel: {type: String, required: true, enum: ['Group', 'VetGroup']},
    pending: {type: Boolean, default: true},
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment', required: false}]
  }
);

// Virtual for post's URL
PostSchema
.virtual('url')
.get(function () {
  return '/post/' + this._id;
});

PostSchema
.virtual('author', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true
});

PostSchema
.virtual('formatted_date')
.get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
});

PostSchema.set('toObject', { virtuals: true });
PostSchema.set('toJSON', { virtuals: true });

//Export model
module.exports = mongoose.model('Post', PostSchema);
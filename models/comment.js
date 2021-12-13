var mongoose = require('mongoose');
const { DateTime } = require("luxon");

var Schema = mongoose.Schema;

var CommentSchema = new Schema(
  {
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    description: {type: String, required: true},
    date: {type: Date, default: Date.now},
    name: {type: String, required: true},
  }
);

CommentSchema
.virtual('formatted_date')
.get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
});

CommentSchema.set('toObject', { virtuals: true });
CommentSchema.set('toJSON', { virtuals: true });

//Export model
module.exports = mongoose.model('Comment', CommentSchema);
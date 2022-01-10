var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var NotificationSchema = new Schema(
  {
    title: {type: String, required: true},
    description: {type: String, required: true},
    post: {type: Schema.Types.ObjectId, ref: 'Post', required: false}
  }
);

// Virtual for group's URL
NotificationSchema
.virtual('url')
.get(function () {
  return '/post/' + this.post;
});

NotificationSchema.set('toObject', { virtuals: true });
NotificationSchema.set('toJSON', { virtuals: true });


//Export model
module.exports = mongoose.model('Notification', NotificationSchema);

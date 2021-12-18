var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var VetGroupSchema = new Schema(
  {
    requests: [{type: Schema.Types.ObjectId, ref: 'Request'}],
    questions: [{type: String}]
  }
);

//Export model
module.exports = mongoose.model('VetGroup', VetGroupSchema);

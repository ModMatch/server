var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RequestSchema = new Schema(
  {
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    responses: [{type: String}],
    approval: {type: Boolean, default: false}
  }
);

//Export model
module.exports = mongoose.model('Request', RequestSchema);

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RequestSchema = new Schema(
  {
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    responses: [{type: String}],
    approval: {type: String, required: true, enum: ['true', 'false', 'pending']}
  }
);

//Export model
module.exports = mongoose.model('Request', RequestSchema);

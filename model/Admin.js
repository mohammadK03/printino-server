var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');

var AdminSchema = new mongoose.Schema({
  username: String,
  password:String,
  role:String,
}, {timestamps: true});
AdminSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Admin', AdminSchema);

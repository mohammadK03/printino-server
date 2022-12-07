var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');

var UploadSchema = new mongoose.Schema({
  type:{type:String},
  alt:{type:String},
  url:{type:String,required:true}
}, {timestamps: true});
UploadSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('UploadSchema', UploadSchema);

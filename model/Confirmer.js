var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');

var ConfirmerSchema = new mongoose.Schema({
  fullName:{type:String},
  username:{type:String,required:true},
  password:{type:String,required:true,minlength:4}
}, {timestamps: true});
ConfirmerSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Confirmer', ConfirmerSchema);

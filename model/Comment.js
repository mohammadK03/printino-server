var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');

var CommentSchema = new mongoose.Schema({
  title: {type:String,maxlength:50},
  text: {type:String,maxlength:400},
  answer:{type:String,maxlength:400},
  rate:{type:Number,min:1,max:5},
  buyOffer:{type:String,enum:["yes","no","unknown"],default:"unknown"},
  userId:{type:mongoose.Types.ObjectId,ref:"User"},
  productId:{type:mongoose.Types.ObjectId,ref:"Product"},
  isActive:{type:Boolean,default:false},
}, {timestamps: true});
CommentSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Comment', CommentSchema);

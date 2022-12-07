var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
let autoIncrement = require('mongoose-auto-increment'); 
autoIncrement.initialize(mongoose);
var BrandSchema = new mongoose.Schema({
  name: String,
  details:String,
  image:{url:String},
}, {timestamps: true});
BrandSchema.plugin(autoIncrement.plugin,"Brand");

BrandSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Brand', BrandSchema);

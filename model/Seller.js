var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
let autoIncrement = require('mongoose-auto-increment'); 
var sellerSchema = new mongoose.Schema({
    username: String,
    password:String,
    fullName:String,
    fee:{type:Number,default:30},
    nationalCard:{type:String, maxlength:10},
    role:String,
    shopName: { type: String, maxlength: 200 },
    shopDetails: { type: String,  maxlength: 500 },
    latlng: [],
    brands:[],
    categories:[],
    address: { type: String, maxlength: 500 },
    phoneNumber: { type: String,maxlength: 11 },
    isActive: {type:Boolean,default:false},
}, { timestamps: true });
sellerSchema.plugin(autoIncrement.plugin, {
    model: 'Seller',
    startAt: 1001,
});
sellerSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Seller', sellerSchema);

var mongoose = require('mongoose');

var mongoosePaginate = require('mongoose-paginate-v2');
var aggregatePaginate = require('mongoose-aggregate-paginate-v2');
let autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose);
var Address = require('./AddressModel')

var SellerOrderSchema = new mongoose.Schema({
    price: Number,
    discountPercent: Number,
    name: {},
    quantity: { type: Number, default: 1 },
    variationsKey: [],
    orderId:{type:String},
    orderNumber:{type:Number},
    productId:{type:mongoose.Schema.Types.ObjectId,ref:"Product"},
    startDate: { type: Date, default: new Date },
    sellerId:{type:Number,ref:"Seller"},
    jStartDate: String,
    endtDate: Date,
    jEndtDate: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, default: "none", enum: ["none", "pending", "done", "problem", "cancel_with_user", "cancel_with_admin"] },
    details: { type: String, minlength: 3, maxlength: 200 }
}, { timestamps: true });
SellerOrderSchema.plugin(mongoosePaginate);
SellerOrderSchema.plugin(aggregatePaginate);
SellerOrderSchema.plugin(autoIncrement.plugin, {
    model: 'SellerOrder',
    startAt: 1000,
});


module.exports = mongoose.model('SellerOrder', SellerOrderSchema);

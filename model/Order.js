var mongoose = require('mongoose');

var mongoosePaginate = require('mongoose-paginate-v2');
var aggregatePaginate = require('mongoose-aggregate-paginate-v2');
let autoIncrement = require('mongoose-auto-increment'); 
autoIncrement.initialize(mongoose);
var Address = require('./AddressModel')

var OrderSchema = new mongoose.Schema({
    products: [{type:Number,ref:"SellerOrder"}],
    orderId:{type:String},
    startDate: { type: Date, default: new Date },
    jStartDate: String,
    endtDate: Date,
    jEndtDate: String,
    userId: {type:mongoose.Schema.Types.ObjectId,ref:"User"},
    status: { type: String, default: "none", enum: ["none", "pending", "done", "problem", "cancel_with_user", "cancel_with_admin"] },
    totalPrice: Number,
    totalDiscount: Number,
    postalCost: Number,
    totalQuantity:Number,
    paymentId: String,
    paymentStatus: { type: String, default: "unpaid", enum: ["unpaid", "paid"] },
    address: Address,


    details: { type: String, minlength: 3, maxlength: 200 }
}, { timestamps: true });
OrderSchema.plugin(mongoosePaginate);
OrderSchema.plugin(aggregatePaginate);
OrderSchema.plugin(autoIncrement.plugin, {
    model: 'Order',
    startAt: 1000,
});


module.exports = mongoose.model('Order', OrderSchema);

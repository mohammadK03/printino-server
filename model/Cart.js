var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
var CartSchema = new mongoose.Schema({
    username:String,
    uniqueCode:{type:Number},

    products: [{
        productId:{type:mongoose.Schema.Types.ObjectId,required:true},
        quantity:{type:Number,default:1},
        variationsKey:[],
    }],
    modifiedOn:{type:Date},
    status:{type:String,enum:['active','expired'],default:"active"}
}, { timestamps: true });
CartSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Cart', CartSchema);

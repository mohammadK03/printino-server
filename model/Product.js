
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
const mongooseIntl = require('mongoose-intl');

var ProductSchema = new mongoose.Schema(
    {
        amazing: { type: Boolean, default: false },
        name: { type: String, minlength: 3, maxlength: 90, es_indexed: true ,intl: true },
        images: [{ url: String }],
        details: { type: String, minlength: 1, maxlength: 2000 ,intl: true },
        with:{type:String,enum:["admin","seller"],default:"admin"},
        postalAmount:{type:Number,default:0},
        sellerId:{type:Number,ref:"Seller"},
        isMillModel:{type:Boolean,default:false},
        isActive:{type:Boolean,default:false},
        price: Number,
        discountPercent: Number,
        productType: { type: String, default: "none", enum: ["none", "variations"] },
        slug: String,
        quantity: { type: Number, default: 0 },
        comments:[{type:mongoose.Schema.Types.ObjectId,ref:"Comment"}],
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            ref: 'Category',
            
        },
        categoryId: String,
        categories: [{
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            ref: 'Category'
        }],
        stock: { type: Number, minlength: 1, maxlength: 999 },
        brand: { type: mongoose.Schema.Types.Number, ref: "Brand" },
        tags: [String],
        similarProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
        dimensions: [{
            key: { type: mongoose.Schema.Types.Number, ref: "Properties" },
            values: [
                { type: mongoose.Schema.Types.Number, ref: "Properties" }
            ]
        }],
        variations: [{
            keys: [Number],
            price: Number,
            discountPercent: { type: Number, default: 0 },
            quantity: { type: Number, default: 0 },

        }],
        attributes: [
            {
                key: { type: String, maxlength: 100 },
                value: { type: String, maxlength: 100 }

            }
        ]

    }
)


ProductSchema.plugin(mongooseIntl, { languages: ['en', 'ar', 'fa'], defaultLanguage: 'ar' });

ProductSchema.plugin(mongoosePaginate);

let model = mongoose.model('Product', ProductSchema);
module.exports = model;

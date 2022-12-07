
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
let autoIncrement = require('mongoose-auto-increment'); 
autoIncrement.initialize(mongoose);
var RowSchema = new mongoose.Schema(
    {
        fluid: { type: Boolean, default: false },
        backgroundColor: { type: String, default: "#ffffff" },
        cols: [
            {
                type: Number,
                ref: "Column",
                index: true
            }
        ],

        pageId:Number,
    }, { timestamps: true }
)
RowSchema.plugin(mongoosePaginate);
RowSchema.plugin(autoIncrement.plugin,"Row");


module.exports = mongoose.model('Row', RowSchema);

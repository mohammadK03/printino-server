
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
let autoIncrement = require('mongoose-auto-increment'); 
autoIncrement.initialize(mongoose);
var PageSchema = new mongoose.Schema(
    {
        url: String,
        lang:{type:String,enum:['en','fa','ar'],default:'ar'},
        mode: { type: String, enum: ['mobile', 'desktop'],default:"desktop" },
        meta: {
            title: String,
            description: String,
            keywords: [String],
        },
        rows: [{
            type: Number,
            ref: "Row",
            index: true
        }]



    }, { timestamps: true }
)
PageSchema.plugin(mongoosePaginate);

PageSchema.plugin(autoIncrement.plugin,"Page");

module.exports = mongoose.model('Page', PageSchema);

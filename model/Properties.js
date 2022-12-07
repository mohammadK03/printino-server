
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
let autoIncrement = require('mongoose-auto-increment'); 
autoIncrement.initialize(mongoose);
const mongooseIntl = require('mongoose-intl');
var PropertySchema = new mongoose.Schema(
    {
        name: {type:String,intl:true},
        parent: {
            type: Number,
            default: null,
            ref: 'Property'
        },
        color: String,
        image: { url: String }
    }, { timestamps: true }
)
PropertySchema.plugin(mongoosePaginate);
PropertySchema.plugin(mongooseIntl, { languages: ['en', 'ar', 'fa'], defaultLanguage: 'ar' });

PropertySchema.plugin(autoIncrement.plugin,"Property");

module.exports = mongoose.model('Property', PropertySchema);

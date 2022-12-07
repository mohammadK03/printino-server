var mongoose = require('mongoose');
let slug = require('../utils/slug');
const mongooseIntl = require('mongoose-intl');

const CategorySchema = new mongoose.Schema({
    name: {type: String,intl: true },
    image: {
        url:{type:String,default:null}
    }
    ,
    slug: { type: String, index: true, unique: true, dropDups: true },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: 'Category'
    },
    ancestors: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            index: true
        },
        name: String,
        slug: String
    }]
});

CategorySchema.pre('save', async function (next) {

    this.slug = slug.slugify(this.name);

    let existSlug = await model.findOne({ slug: this.slug });
    if (existSlug) {
        var n = Math.floor(Math.random() * 99) + 1
        this.slug += "-" + n;
    }

    next();
})





CategorySchema.plugin(mongooseIntl, { languages: ['en', 'ar', 'fa'], defaultLanguage: 'ar' });

let model = mongoose.model('Category', CategorySchema);
module.exports = model;

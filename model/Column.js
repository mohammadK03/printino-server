
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
let autoIncrement = require('mongoose-auto-increment'); 
autoIncrement.initialize(mongoose);
var ColumnSchema = new mongoose.Schema(
    {
        size:{
            xs:{type:Number,default:12},
            sm:{type:Number,default:12},
            md:{type:Number,default:12},
            lg:{type:Number,default:12},
        },
        elevation:{type:Number,default:0},
        padding:{type:String,default:"0 0 0 0"},
        name:String,
        radius:{type:String,default:"0"},

        margin:{type:String,default:"0 0 0 0"},
        backgroundColor:{type:String,default:"#ffffff"},
        layoutType:{type:String,enum:['horizontalList','banner','gridList','slider']},
        dataUrl:{type:String,default:null},
        dataType:{type:String,enum:["product","internal","brand","category"]},

        isMore:{type:Boolean,default:false},

        moreUrl:{type:String},
        content:mongoose.Schema.Types.Mixed,
       
        rowId:Number,
    }, { timestamps: true }
)
ColumnSchema.plugin(mongoosePaginate);
ColumnSchema.plugin(autoIncrement.plugin,"Column");


module.exports = mongoose.model('Column', ColumnSchema);

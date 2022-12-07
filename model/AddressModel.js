var mongoose = require('mongoose');
var AddressSchema = new mongoose.Schema(
    {
        postalCode:Number,
        address:String,
        state:String,
        city:String,
        latitude: Number,
        longitude: Number,
    }
)
module.exports =  AddressSchema;
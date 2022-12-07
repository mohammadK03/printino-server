var mongoose = require('mongoose');

var ValueSchema = new mongoose.Schema({
  dollar:Number,
}, {timestamps: true});

module.exports = mongoose.model('Value', ValueSchema);
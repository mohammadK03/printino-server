var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
var Address=require('./AddressModel');
var generateNumber=require('../utils/generate');
var UserSchema = new mongoose.Schema({
    username: String,
    password: { type: String, maxlength: 200, minlength: 4 },
    verifyCode: { type: String, expires: '2m' },
    accountType: String,
    phoneNumber: String,
    email:{type:String},
    uniqueCode:{type:Number,unique:true},
    isActive: String,
    identifyCode:String,
    activeSession: [String],
    LastSendSmsVerificationTime: Date,
    countGetSmsInDay: Number,
    endTimeSubscribe: Date,
    role: String,
    sex: { type: Number, max: 2 },
    name: { type: String, minlength: 0, maxlength: 10 },
    lastname: { type: String, minlength: 0, maxlength: 15 },
    nationalCard: { type: String, minlength: 0, maxlength: 10 },
    birthDate:String,
    fcmRegistrationToken: {type:String,default:"none"},
    favoritesProducts:[{type: mongoose.Schema.Types.ObjectId,ref:"Product"}],
    addresses:[Address],
}, { timestamps: true });

UserSchema.plugin(mongoosePaginate);
UserSchema.pre('save', async  function(next) {
    let exist=false;
    do{
        this.uniqueCode=generateNumber.getRandomIntInclusive(1111111,9999999);
       let user= await model.findOne({uniqueCode:this.uniqueCode})
        if(user){
            exist=true;
        }else{
            exist=false;
        }
    }while(exist);

    next();
  });
  let model=mongoose.model('User', UserSchema);
module.exports = model

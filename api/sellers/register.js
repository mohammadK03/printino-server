let express =require('express')
let router=express.Router();
let Seller=require('../../model/Seller');
let messageToClient=require('../../utils/messages').messageToClient;
const hash = require('password-hash');

router.post('/',(req,res,next)=>{
    let {fullName, shopName  ,address, phoneNumber,username,password} =req.body;
    if(!username){return res.json(messageToClient(false,"username_is_required"))}
    if(!fullName){return res.json(messageToClient(false,"fullName_is_required"))};
    if(!shopName){return res.json(messageToClient(false,"shopName_is_required"))};
    if(!phoneNumber){return res.json(messageToClient(false,"phoneNumber_is_required"))};
    if(!address){return res.json(messageToClient(false,"address_is_required"))};
    if(!password){return res.json(messageToClient(false,"password_is_required")) }
    next();
});
router.post('/',async(req,res,next)=>{
    let {username,password} =req.body;
    if(password.length<4){
        return res.json(messageToClient(false,"password_min_length_4"))
    }
    let seller=await Seller.findOne({username})
    if(seller){
        return res.json(messageToClient(false,"username_exist"))
    }
    next();
});
router.post('/',async(req,res)=>{
    let {fullName, shopName  ,address, phoneNumber,shopDetails,username,password,latlng,ntCode,sheba,bankNumber,brands,categories} =req.body;
    try {
        let seller=new Seller({fullName,shopName,address,phoneNumber,shopDetails,username,password:hash.generate(password),latlng,ntCode,sheba,bankNumber,brands,categories,isActive:false});
        await seller.save();
        res.json(messageToClient(true,"seller_added"))
    } catch (error) {
        res.json(messageToClient(false,"internal_error"))
        console.log(error)
    }
   
});
module.exports= router;

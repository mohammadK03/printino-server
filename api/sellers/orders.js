let express=require("express");
let router=express.Router();
const SellerOrder=require('../../model/SellerOrder');
const messageToClient=require('../../utils/messages').messageToClient;
router.get('/',async(req,res)=>{
    let decoded=req.user;
    if(decoded.role==="seller"){
        let sellerOrder= await SellerOrder.find({sellerId:decoded.id}).sort({"startDate":-1});
        res.json(messageToClient(true,"sellerOrder",sellerOrder))
    }else{
        res.statusCode = 401;
        return res.json(messageToClient(false, 'access_denied', {}))

    }
})


module.exports=router;

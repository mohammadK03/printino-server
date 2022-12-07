let express=require('express');
let router=express.Router();
let Confirmer=require('../model/Confirmer');
let mtc=require('../utils/messages').messageToClient;
let vToken=require('../utils/jwt')
const hash = require('password-hash');
router.use('/login',require('./confirmers/login'));
router.use('/orders',vToken.verifyToken,require('./confirmers/orders'));

router.get('/',vToken.verifyToken,vToken.isAdmin,async (req,res)=>{
    let confirmers=await Confirmer.find();
    res.json(mtc(true,"confirmers",confirmers));
});
router.post('/',vToken.verifyToken,vToken.isAdmin,async (req,res)=>{
    let username=req.body.username;
    let password=req.body.password;
    if(!username){return res.json(mtc(false,"username_is_required",{}))}
    if(!password){return res.json(mtc(false,"password_is_required",{}))}
    if(password.length<4){return res.json(mtc(false,"password_minlength_4",{}))}
    let CheckConfirmer=await Confirmer.findOne({username});
    if(CheckConfirmer){return res.json(mtc(false,"username_is_exist",{}))}
    req.body.password = hash.generate(password);

    let confirmer=new Confirmer(req.body);
    try {
        await confirmer.save();
        return res.json(mtc(true,"confirmer_added",{}))
    } catch (error) {
        console.log(error)
        return res.json(mtc(false,"internal_error",{}))
    }
    
});
router.delete('/:id',vToken.verifyToken,vToken.isAdmin,async (req,res)=>{
    try {
        await Confirmer.deleteOne({_id:req.params.id});
        return res.json(mtc(true,"confirmer_deleted",{}))

    } catch (error) {
        console.log(error)
        return res.json(mtc(false,"internal_error",{}))
    }
})

module.exports=router;
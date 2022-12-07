let express=require('express')
let router=express.Router();
let Users=require('../../model/User')
const vToken = require('../../utils/jwt')
const messageToClient = require('../../utils/messages').messageToClient;

router.get('/', vToken.verifyToken, async (req, res) => {
    const decoded = req.user;
    if(decoded.role==="user"){
        try {
            let user= await Users.findOne({username:decoded.username}).select('addresses');
            res.send(messageToClient(true, 'addresses', user.addresses));
        } catch (error) {
            console.log(error)
            res.statusCode=500;
            res.send(messageToClient(false, 'internal_error', []));
        }
  
    }
});

router.post('/', vToken.verifyToken, async (req, res) => {
    const decoded = req.user;
    if(decoded.role==="user"){
    await  Users.update(
        { username: decoded.username }, 
        { $push: { addresses:req.body } }
    );
    res.send(messageToClient(true, 'address_added', {}));
    }
});
router.delete('/:addressId', async (req, res) => {
    let decoded = req.user;
    try {
        let _id = req.params.addressId;
        if (!_id) {
            return res.json(messageToClient(false, "_id_is_required", {}));
        }
        await Users.updateOne({ username: decoded.username },{ $pull: { addresses:{_id} }});

        res.status(200).send(messageToClient(true, 'remove_address', {}));

    } catch (error) {
        console.log(error)
        res.status(500).json(messageToClient(false, "internall_error", error.message));

    }

});


   module.exports=router;

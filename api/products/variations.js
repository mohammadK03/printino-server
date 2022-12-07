let express = require('express')
let router = express.Router({ mergeParams: true });
const Product = require('../../model/Product');

let messageToClient = require('../../utils/messages').messageToClient;
const vToken = require('../../utils/jwt')

function isAdmin(req, res, next) {
    let decoded = req.user;
    if (decoded && decoded.role === "admin"|| decoded.role === "seller") {
        next();
    } else {
        res.statusCode = 403;
        res.json(messageToClient(false, "access_denied", {}));

    }
}

router.post('/', vToken.verifyToken, isAdmin, async (req, res) => {
    let keys = req.body.keys;
    let price=req.body.price;
    if(!keys || keys.length<1){
        return res.status(200).json(messageToClient(false, "keys_is_required", {}));
    }
    if(!price){
        return res.status(200).json(messageToClient(false, "price_is_required", {}));
    }
    
    try {
        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json(messageToClient(false, "product_not_found", {}));
        }


        const found = product.variations.find(item => compareArray(keys,item.keys));
        if (found) {
            return res.status(200).json(messageToClient(false, "varaition_is_exist", {}));
        }
    
        product.variations.push(req.body);
        product.isUpdate=true;
        await product.save();
        res.status(201).json(messageToClient(true, 'varaition_added', {}));

    } catch (error) {
        console.log(error)
        res.status(500).json(messageToClient(false, "internall_error", error.message));
    }

});

router.delete('/:variationId', vToken.verifyToken, isAdmin, async (req, res) => {
    try {
        await Product.update({ _id: req.params.id }, { $pull: {variations:{ _id: req.params.variationId } } });
       
        res.status(200).send(messageToClient(true, 'varaition_deleted', {}));

    } catch (error) {
        console.log(error)
        res.status(500).json(messageToClient(false, "internall_error", error.message));

    }

});
//router.delete('/:id',vToken.verifyToken,isAdmin, (req, res) => { });

function compareArray(array1=[], array2=[]) {
    array1=array1.sort()
    array2=array2.sort();
    return JSON.stringify(array1) === JSON.stringify(array2);
}


module.exports = router;
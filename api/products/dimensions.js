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
    let key = req.body.dimensionKey;
    if (key === undefined || key === null) {
        return res.status(201).json(messageToClient(false, "dimensionKey_is_required", {}));
    }
    try {
        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json(messageToClient(false, "product_not_found", {}));
        }


        const found = product.dimensions.find(item => item.key == key);
        if (found) {
            return res.status(200).json(messageToClient(false, "dimension_is_exist", {}));
        }
        product.productType="variations";
        product.dimensions.push({key,values:[]});
        product.isUpdate=true;
        await product.save();
        res.status(201).json(messageToClient(true, 'dimension_added', {}));

    } catch (error) {
        console.log(error)
        res.status(500).json(messageToClient(false, "internall_error", error.message));
    }

});

router.delete('/:dimensionKey', vToken.verifyToken, isAdmin, async (req, res) => {
    let dimensionKey = req.params.dimensionKey;
    let productId=req.params.id;
    try {
        let product=await Product.findById(productId);
        product.variations=[];
        product.save();
        await Product.updateMany({ _id: productId }, { $pull: { 'dimensions': { 'key': dimensionKey } } });
        res.status(201).json(messageToClient(true, 'dimension_deleted', {}));

    } catch (error) {
        console.log(error)
        res.status(500).json(messageToClient(false, "internall_error", error.message));
    }

});
router.post('/:key/values/', vToken.verifyToken, isAdmin, async (req, res) => {
    
    try {
        let values=req.body.values;
        if(!values){
            return res.status(200).json(messageToClient(false, "values_is_required", {}));

        }
        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json(messageToClient(false, "product_not_found", {}));
        }
        const found = product.dimensions.find(item => item.key == req.params.key);
        found.values=values;
        product.isUpdate=true;
        await product.save();
        res.status(200).send(messageToClient(true, 'property_updated', {}));

    } catch (error) {
        console.log(error)
        res.status(500).json(messageToClient(false, "internall_error", error.message));

    }

});

// router.delete('/:id', vToken.verifyToken, isAdmin, async (req, res) => {
//     try {

//         await Property.deleteOne({ _id: req.params.id });
//         res.status(200).send(messageToClient(true, 'property_updated', {}));

//     } catch (error) {
//         console.log(error)
//         res.status(500).json(messageToClient(false, "internall_error", error.message));

//     }

// });
//router.delete('/:id',vToken.verifyToken,isAdmin, (req, res) => { });




module.exports = router;
let express = require('express')
let router = express.Router();
let Cart = require('../../model/Cart');
let Product = require('../../model/Product');
let messageToClient = require('../../utils/messages').messageToClient;
let lang=require('../../utils/lang');
let Value=require('../../model/Value')
router.get('/', async (req, res) => {
    try {
        let decoded = req.user;
        let cart = await Cart.aggregate([
            {
                '$match': {
                    'username': decoded.username,
                    'status': 'active'
                }
            }, {
                '$unwind': {
                    'path': '$products'
                }
            }, {
                '$lookup': {
                    'from': 'products',
                    'localField': 'products.productId',
                    'foreignField': '_id',
                    'as': 'products.product'
                }
            }, {
                '$addFields': {
                    'quantity': '$products.quantity',
                    '_id': '$products._id',
                    'variationsKey': '$products.variationsKey'
                }
            }, {
                '$lookup': {
                    'from': 'properties',
                    'localField': 'variationsKey',
                    'foreignField': '_id',
                    'as': 'variations'
                }
            }, {
                '$project': {
                    'quantity': 1,
                    'variationsKey': 1,
                    'variations': 1,
                    'product': {
                        '$arrayElemAt': [
                            '$products.product', 0
                        ]
                    }
                }
            }
        ]);
        if(cart){
            let value = await Value.findOne();
            cart=lang.convertPriceArrayOrder(cart,value.dollar)
        }
        
        res.status(201).json(messageToClient(true, "cart", cart));

    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
});

router.post('/', async (req, res) => {
    let decoded = req.user;
    let productId = req.body.productId;
    let quantity = req.body.quantity;
    if (!quantity) {
        quantity = 1;
    }
    let variationsKey = req.body.variationsKey;
    if (!productId) {
        return res.status(200).json(messageToClient(false, "productId_is_required", {}));

    }

    try {
        let product = await Product.findById(productId);
        if (!product) { return res.status(200).json(messageToClient(false, "product_not_found", {})); }
        if (product.productType === "variations") {
            if (!variationsKey || variationsKey.length < 1) {
                return res.status(200).json(messageToClient(false, "variationsKey_is_required", {}));

            }
            let productVariation = null;
            for (var a = 0; a < product.variations.length; a++) {
                if (compareArray(product.variations[a].keys, variationsKey)) {
                    productVariation = product.variations[a]
                    break;
                }
            }
            if (!productVariation) {
                console.log("variationsKey_is_invalid")
                return res.status(200).json(messageToClient(false, "variationsKey_is_invalid", {}));
            }
            if (productVariation.quantity < quantity) {
                return res.status(200).json(messageToClient(false, "product_not_available", {}));
            }
        } else {
            variationsKey = null;
            if (product.stock < quantity) {
                return res.status(200).json(messageToClient(false, "product_not_available", {}));
            }
        }
        let cart = await Cart.findOne({ username: decoded.username, status: 'active' });
        if (cart) {
            // let productExist = await Cart.findOne({ _id: cart._id, "products.productId": productId, "products.variationsKey": variationsKey });
            let productExist = await Cart.findOne({ _id: cart._id , products: { $elemMatch: { productId: productId, variationsKey: variationsKey}}});
            if (productExist) {
                if (variationsKey == null) {
                    await Cart.updateOne({ _id: cart._id, "products.productId": productId, }, {
                        '$set': {
                            'products.$.quantity': quantity,
                        }
                    });
                } else {
                    await Cart.updateOne({ _id: cart._id , products: { $elemMatch: { productId: productId, variationsKey: variationsKey}}}, {
                        '$set': {
                            'products.$.quantity': quantity,
                        }
                    });
                }

            } else {
                await Cart.updateOne({ _id: cart._id }, { $push: { products: { productId, quantity, variationsKey } } });

            }
        } else {
            let username = decoded.username;
            let uniqueCode = decoded.uniqueCode;

            let products = [];
            products.push({ productId, quantity, variationsKey });
            let cart = new Cart({ username,uniqueCode, products });
            await cart.save()
        }
        res.status(201).json(messageToClient(true, "cart_edited", {}));
    } catch (error) {
        console.log(error)
        res.status(500).json(messageToClient(false, "internall_error", error.message));
    }

});
router.delete('/', async (req, res) => {
    let _id = req.query.id;
    let decoded = req.user;

    if (!_id) {
        return res.status(200).json(messageToClient(false, "_id_is_required", {}));

    }

    try {

        await Cart.updateMany({ username: decoded.username, status: 'active' }, { $pull: { 'products': { '_id': _id } } });
        res.status(201).json(messageToClient(true, "cart_edited", {}));

    } catch (error) {
        console.log(error)
        res.status(500).json(messageToClient(false, "internall_error", error.message));
    }
});
function compareArray(array1 = [], array2 = []) {
    array1 = array1.sort();
    array2 = array2.sort();
    return JSON.stringify(array1) === JSON.stringify(array2);
}



module.exports = router;
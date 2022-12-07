let express = require('express');
let router = express.Router();
let Cart = require('../../model/Cart');
let lang = require('../../utils/lang');
let Value = require('../../model/Value');
let messageToClient = require('../../utils/messages').messageToClient;
let Order = require('../../model/Order');
let SellerOrder = require('../../model/SellerOrder');
let User = require('../../model/User');
let moment = require('jalali-moment');
let generate = require('../../utils/generate')
let freePostage = 200000;

router.use('*', (req, res, next) => {
    let decoded = req.user;
    if (decoded && decoded.role === "confirmers"||decoded.role==='admin') {
        next();
    } else {
        res.statusCode = 403;
        res.json(messageToClient(false, "access_denied", {}));
    }
})
router.get('/:code', async (req, res) => {
    try {
        let cart = await Cart.aggregate([
            {
                '$match': {
                    'uniqueCode': parseInt(req.params.code),
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
        if (cart) {
            let value = await Value.findOne();
            cart = lang.convertPriceArrayOrder(cart, value.dollar)
        }

        res.status(201).json(messageToClient(true, "cart", cart));

    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
});


router.post('/:code', async (req, res) => {
    let decoded = req.user;
    let jStartDate = moment(new Date(), 'YYYY/MM/DD hh:mm:ss').locale('fa').format('YYYY-MM-DD hh:mm:ss');
    let address = req.body;
    let user;
    try {
        user = await User.findOne({ uniqueCode: req.params.code });
        if (!user) {
            return res.json(messageToClient(false, 'user_not_find', {}))

        }
    } catch (error) {
        console.log(error)
        res.statusCode = 500;
        return res.json(messageToClient(false, 'internal_error', {}))
    }
    if (!address) {
        return res.json(messageToClient(false, 'address_is_required', {}))

    }
    let cart = await Cart.aggregate([
        {
            '$match': {
                'uniqueCode': parseInt(req.params.code),
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
    if (!cart || cart.length < 1) {
        return res.json(messageToClient(false, 'cart_is_empty', {}))
    }
    let totalPrice = 0;
    let totalDiscount = 0;
    let totalQuantity = 0;
    let postalCost = 0;
    let value = await Value.findOne();
    cart = lang.convertPriceArrayOrder(cart, value.dollar)
    let products = [];

    const orderId = await generateOrderId();
    let i=0;
    for (item of cart) {
        if (item.product.productType === "variations") {
            if (item.product.variations) {
                let variations = item.product.variations;
                const result = variations.find(({ keys }) => compareArray(keys, item.variationsKey));

                if (result) {
                    item.product.quantity = result.quantity;
                    item.product.price = result.price;
                    item.product.priceIR = result.priceIR;

                    item.product.discountPercent = result.discountPercent;
                }
            }

        }
        let price = item.product.price;
        let discountPercent = item.product.discountPercent;
        let quantity = item.quantity;
        totalQuantity += quantity;
        if (item.product.postalAmount) {
            postalCost += (quantity * item.product.postalAmount);

        }
        let sellerOrder = new SellerOrder({ name: item.product.name, price: item.product.priceIR, quantity, variationsKey: item.variationsKey, sellerId: item.product.sellerId, startDate: new Date() ,orderId,orderNumber:i});
        await sellerOrder.save();
        products.push(sellerOrder._id);
        
        let discount = (price * quantity) * (discountPercent / 100);
        price = price * quantity;

        let priceWithDiscount = price - discount;
        totalPrice += priceWithDiscount;
        totalDiscount += discount;
        i++;
    }
    // if (freePostage <= totalPrice) {
    //     postalCost = 0;
    // }
    try {
        let order = new Order({ totalPrice: parseFloat(totalPrice).toFixed(2), totalDiscount: parseFloat(totalDiscount).toFixed(2), totalQuantity, postalCost, userId: decoded.id, products, startDate: new Date(), jStartDate, address, paymentStatus: "paid",orderId });
        await order.save();
        res.json(messageToClient(true, "order_added", { orderId: order._id }));
        await Cart.deleteOne({ 'uniqueCode': req.params.code });
    } catch (error) {
        console.log(error)
        res.statusCode = 500;
        return res.json(messageToClient(false, 'internal_error', {}))

    }



});
async function generateOrderId() {
    let exist = true;
    let orderId = "";
    do {
        orderId = generate.getRandomString(6);
        let order = await Order.findOne({ orderId });
        if (!order) {
            exist = false;
        }
    } while (exist);
    return orderId;
}

module.exports = router;
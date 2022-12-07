let express = require('express');
let router = express.Router();
let Cart = require('../../model/Cart');
let Order = require('../../model/Order');
let SellerOrder=require('../../model/SellerOrder');
let moment = require('jalali-moment');
var ZarinpalCheckout = require('../../lib/zarinpal');
var zarinpal = ZarinpalCheckout.create('46680417-e6ac-4d01-9215-8c92a857ccfc', true);
const vToken = require('../../utils/jwt')

const messageToClient = require('../../utils/messages').messageToClient;
const sendSms = require('../../utils/messages').sendSms;
const User = require('../../model/User');
let Value=require('../../model/Value');
let lang=require('../../utils/lang');
let freePostage = 200000;
router.get('/', vToken.verifyToken, async (req, res) => {
    let decoded = req.user;

    if (decoded.role === "user") {
        let orders = await Order.find({ userId: decoded.id }).populate('products').sort({ 'startDate': 1 });
        if (orders.length >= 1) {
            return res.json(messageToClient(true, 'orders', orders))

        } else {
            return res.json(messageToClient(false, 'orders_empty', {}))

        }
    } else if (decoded.role === "admin") {
        let page = req.query.page;
        let status = req.query.status;
        let query={};
        
        let options = {
            page: 1,
            limit: 15,
            sort: { startDate: -1 },
            populate: 'userId products',
        };
        console.log(status)
        if(status && status.length>2){
            query.status=status;
        }
        if (page && page > 1) {
            options.page = page;
        }

        let orders = await Order.paginate(query, options);
        return res.json(messageToClient(true, 'orders', orders))

    } else {
        res.statusCode = 401;
        return res.json(messageToClient(false, 'access_denied', {}))

    }

})
router.post('/:id/status', vToken.verifyToken, async (req, res) => {
    let decoded = req.user;
    let status = req.body.status;
    if (decoded.role === "admin") {
        let order = await Order.findByIdAndUpdate({_id:req.params.id}, { status } );
        // try {
        //     let user = await User.findById(order.userId);
        //     console.log(user);
        //     if (user) {
        //         if (status === "pending") {
        //             sendSms(user.phoneNumber, `مشتری محترم واردات،\n سفارش شما با شماره سفارش ${req.params.id} در حال آماده سازی می باشد.`);

        //         } else if (status === "done") {
        //             sendSms(user.phoneNumber, `مشتری محترم واردات،\n سفارش شما با شماره سفارش ${req.params.id} ارسال گردید.`);

        //         }
        //     }

        // } catch (error) {
        //     console.log(error)
        // }
        return res.json(messageToClient(true, 'status_updated', {}))

    } else {
        res.statusCode = 401;
        return res.json(messageToClient(false, 'access_denied', {}))

    }

})
router.get('/:id', vToken.verifyToken, async (req, res) => {
    let decoded = req.user;
    try {
        let order = await Order.findOne({ userId: decoded.id, _id: req.params.id }).populate('products');
        if (order) {
            return res.json(messageToClient(true, 'order', order))

        } else {
            return res.json(messageToClient(false, 'order_not_found', {}))

        }
    } catch (error) {
        res.statusCode = 500;
        return res.json(messageToClient(false, 'internal_error', {}))
    }


})

// router.post('/', vToken.verifyToken, async (req, res) => {
//     let decoded = req.user;
//     let jStartDate = moment(new Date(), 'YYYY/MM/DD hh:mm:ss').locale('fa').format('YYYY-MM-DD hh:mm:ss');
//     let address = req.body;
//     let user;
//     try {
//         user = await User.findById(decoded.id);
//         if (!user) {
//             return res.json(messageToClient(false, 'user_not_find', {}))

//         }
//     } catch (error) {
//         console.log(error)
//         res.statusCode = 500;
//         return res.json(messageToClient(false, 'internal_error', {}))
//     }
//     if (!address) {
//         return res.json(messageToClient(false, 'address_is_required', {}))

//     }
//     let cart = await Cart.aggregate([
//         {
//             '$match': {
//                 'username': decoded.username,
//                 'status': 'active'
//             }
//         }, {
//             '$unwind': {
//                 'path': '$products'
//             }
//         }, {
//             '$lookup': {
//                 'from': 'products',
//                 'localField': 'products.productId',
//                 'foreignField': '_id',
//                 'as': 'products.product'
//             }
//         }, {
//             '$addFields': {
//                 'quantity': '$products.quantity',
//                 '_id': '$products._id',
//                 'variationsKey': '$products.variationsKey'
//             }
//         }, {
//             '$project': {
//                 'quantity': 1,
//                 'variationsKey': 1,
//                 'variations': 1,
//                 'product': {
//                     '$arrayElemAt': [
//                         '$products.product', 0
//                     ]
//                 }
//             }
//         }
//     ]);

//     if (!cart || cart.length < 1) {
//         return res.json(messageToClient(false, 'cart_is_empty', {}))
//     }
//     let totalPrice = 0;
//     let totalDiscount = 0;
//     let totalQuantity = 0;
//     let postalCost = 0;
//     let value = await Value.findOne();
//     cart=lang.convertPriceArrayOrder(cart,value.dollar)
//     let products = [];
//     for (item of cart) {

//         if (item.product.productType === "variations") {
//             if (item.product.variations) {
//                 let variations = item.product.variations;
//                 const result = variations.find(({ keys }) => compareArray(keys, item.variationsKey));

//                 if (result) {
//                     item.product.quantity = result.quantity;
//                     item.product.price = result.price;
//                     item.product.priceIR=result.priceIR;
                    
//                     item.product.discountPercent = result.discountPercent;
//                 }
//             }

//         }
//         let price = item.product.price;
//         let discountPercent = item.product.discountPercent;
//         let quantity = item.quantity;
//         totalQuantity += quantity;
//         postalCost+=(quantity*item.product.postalAmount);
//         let sellerOrder =new SellerOrder({name:item.product.name,price:item.product.priceIR,quantity,variationsKey: item.variationsKey,sellerId:item.product.sellerId,startDate:new Date()} );
//         await sellerOrder.save();
//         products.push({ name: item.product.name, price, discountPercent, quantity, variationsKey: item.variationsKey ,postalAmount:item.product.postalAmount});
//         let discount = (price * quantity) * (discountPercent / 100);
//         price = price * quantity;
//         let priceWithDiscount = price - discount;
//         totalPrice += priceWithDiscount;
//         totalDiscount += discount;
//     };


//     if (freePostage <= totalPrice) {
//         postalCost = 0;
//     }
//     try {
//         let order = new Order({ totalPrice, totalDiscount, totalQuantity, postalCost, userId: decoded.id, products, startDate: new Date(), jStartDate, address });
//         await order.save();
//         res.json(messageToClient(true, "order_added", { orderId: order._id }));
//         await Cart.deleteOne({ 'username': decoded.username });
//     } catch (error) {
//         console.log(error)
//         res.statusCode = 500;
//         return res.json(messageToClient(false, 'internal_error', {}))

//     }



// });

// router.post('/checkout', vToken.verifyToken, async (req, res) => {
//     let decoded = req.user;
//     let order = await Order.findOne({ userId: decoded.id, _id: req.body._id });
//     if (!order) {
//         return res.json(messageToClient(false, 'order_not_found', {}))
//     }

//     try {
//         let pay = await zarinpal.PaymentRequest({
//             Amount: order.totalPrice + order.postalCost,
//             CallbackURL: 'https://back.dark.devopsing.ir/api/users/orders/checkout/verify', //https://back.dark.devopsing.ir/api/users/orders/checkout/verify
//             Description: order._id + ""
//         })
//         order.paymentId = pay.authority;
//         await order.save();
//         res.json({ success: true, message: 'pay', body: { url: pay.url } });
//     } catch (error) {
//         console.log(error)
//         res.statusCode = 500;
//         res.json({ success: false, message: 'internal_error' });

//     }
// })

// router.get('/checkout/verify', async function (req, res, next) {
//     try {
//         let order = await Order.findOne({ paymentId: req.query.Authority });
//         if (!order) {
//             return res.json(messageToClient(false, 'order_not_found', {}))
//         }
//         let response = await zarinpal.PaymentVerification({
//             Authority: req.query.Authority,
//             Amount: order.totalPrice + order.postalCost
//         });
//         if (response.status !== 100) {
//             res.render('ipg', { success: false });
//         } else {
//             order.paymentStatus = "paid";
//             await order.save();
//             try {
//                 let user = await User.findById(order.userId);
//                 sendSms(user.phoneNumber, `مشتری محترم واردات،\n سپاس از خرید شما،سفارش شما با شماره سفارش ${order._id} ثبت شد.`);
//             } catch (error) {
//                 console.log(error)
//             }

//             res.render('ipg', { success: true });
//         }
//     } catch (error) {
//         res.statusCode = 500;
//         res.render('ipg', { success: false });
//         console.error(error)
//     }

// });
function compareArray(array1 = [], array2 = []) {
    array1 = array1.sort();
    array2 = array2.sort();
    return JSON.stringify(array1) === JSON.stringify(array2);
}
module.exports = router;

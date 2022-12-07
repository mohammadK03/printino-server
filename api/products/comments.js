let express = require('express')
let router = express.Router({ mergeParams: true });
const Comment = require('../../model/Comment');
const Product = require('../../model/Product');

let messageToClient = require('../../utils/messages').messageToClient;
const vToken = require('../../utils/jwt')

function isAdmin(req, res, next) {
    let decoded = req.user;
    if (decoded && decoded.role === "admin") {
        next();
    } else {
        res.statusCode = 403;
        res.json(messageToClient(false, "access_denied", {}));

    }
}

router.post('/', vToken.verifyToken, async (req, res) => {
    let decoded=req.user;
    let { text,title ,rate,buyOffer} = req.body;
    let insertData={};
    if (!text) { return res.json(messageToClient(false, "text_required", {}));}
    if (!title) { return res.json(messageToClient(false, "title_is_required", {}));}

    try {
        let product=await Product.findById(req.params.id);
        if(!product){ res.json(messageToClient(false, "product_not_found", {}));}
        insertData.title=title;

        insertData.text=text;

        insertData.rate=rate;
        insertData.buyOffer=buyOffer;
        insertData.productId=product._id;
        insertData.userId=decoded.id;
        let comment=new Comment(insertData)
        await comment.save();
        res.json(messageToClient(true, "comment_added", {}));

    } catch (error) {
        console.log(error);
        res.statusCode = 500;
        res.json(messageToClient(false, "internal_error", {}));
    }

});
router.get('/', async (req, res) => {
    try {
        let comments=await Comment.find({productId:req.params.id}).populate('userId','name lastname _id');
        res.json(messageToClient(true, "comments", comments));

    } catch (error) {
        console.log(error);
        res.statusCode = 500;
        res.json(messageToClient(false, "internal_error", {}));
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
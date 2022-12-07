var express = require('express');
var router = express.Router();
const hash = require('password-hash');
const messageToClient = require('../utils/messages').messageToClient;
var Seller = require('../model/Seller');
router.use('/login',require('./sellers/login'));
const vToken = require('../utils/jwt')
router.get('/',vToken.verifyToken,vToken.isAdmin,async function (req, res, next) {
    const page = req.query.page;

    let query = {

    };

    let options = {
        page: 1,
        limit: 10,
        select:'-password'
    };

    if (page && page > 1) {
        options.page = page;
    }
    if (req.query.search) {
        query["name"] = { $regex: new RegExp(req.query.search) };
    } else {
        //options = { };
    }


    try {
        const sellers = await Seller.paginate(query, options);
        res.json(messageToClient(sellers));

    } catch (error) {
        console.log(error)
        res.json(messageToClient(false, 'internal_error', {}));

    }

});

router.get('/:id',vToken.verifyToken, async function (req, res, next) {
    let user=req.user;
    let id;
    if(user.role==="admin"){
        id=req.params.id;
    }else if(user.role==="seller"){
        id=user.id;
    }else{
        return res.json(messageToClient(false, 'access_denied', {}));
    }
    if(!id){
        return res.json(messageToClient(false, 'id_is_required', {}));
    }
    try {
        const seller = await Seller.findOne({ _id:id }).select("-__v -createdAt -updatedAt");
        res.json(messageToClient(true, 'seller', seller));

    } catch (error) {
        console.log(error)
        res.json(messageToClient(false, 'internal_error', {}));

    }
});



router.post('/',vToken.verifyToken,vToken.isAdmin, vToken.verifyToken, async function (req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    if (!username) { return res.json(messageToClient(false, 'username_is_required', {})); }
    if (!password) { return res.json(messageToClient(false, 'password_is_required', {})); }
    try {


        if (username) {
            const findResult = await Seller.findOne({ username });
            if (findResult) {
                return res.json(messageToClient(false, 'username_is_exist', {}));
            }
        }
        req.body.password = hash.generate(password);
        let seller = new Seller(req.body);
        await seller.save();
        return res.json(messageToClient(true, 'seller_added', {}));

    } catch (err) {
        console.log(err)
        return res.json(messageToClient(false, 'internal_error', {}));

    }
});

router.put('/:id', vToken.verifyToken, async function (req, res, next) {
    let user=req.user;
    let id;
    if(user.role==="admin"){
        id=req.params.id;
    }else if(user.role==="seller"){
        id=user.id;
    }else{
        return res.json(messageToClient(false, 'access_denied', {}));
    }
    if(!id){
        return res.json(messageToClient(false, 'id_is_required', {}));
    }
    try {
        let password = req.body.password;
        if (password) {
            req.body.password = hash.generate(password);
        }
        req.body.role = "seller";
        await Seller.updateOne({ _id: id}, req.body);
        res.json({ success: true, message: 'seller_updated' });

    } catch (err) {
        console.log(err)
        return res.json(messageToClient(false, 'internal_error', {}));
    }
});

router.delete('/:id', vToken.verifyToken,vToken.isAdmin, async function (req, res, next) {
    try {
        const seller = await Seller.deleteOne({ _id: req.params.id });

        res.json({ success: true, message: 'seller_deleted' });

    } catch (e) {
        res.send(e);
    }

});
module.exports = router;
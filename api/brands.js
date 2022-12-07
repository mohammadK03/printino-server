let express = require('express')
let router = express.Router();
let Brand = require('../model/Brand');
let messageToClient = require('../utils/messages').messageToClient;
const vToken = require('../utils/jwt')

function isAdmin(req, res, next) {
    let decoded = req.user;
    if (decoded && decoded.role === "admin") {
        next();
    } else {
        res.statusCode = 403;
        res.json(messageToClient(false, "access_denied", {}));
    }
}

router.get('/', async (req, res) => {
    try {
        let brands = await Brand.find().select('name details image');
        res.status(201).json(messageToClient(true, "brands", brands));
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
});
router.post('/', vToken.verifyToken, isAdmin, async (req, res) => {
    
    try {
        let brand=new Brand(req.body);
        await brand.save();
        res.status(201).json(messageToClient(true, 'brand_added', {}));

    } catch (error) {
        res.status(500).json(messageToClient(false, "internall_error", error.message));
    }

});
router.put('/:id', vToken.verifyToken, isAdmin, async (req, res) => {
    try {

        await Brand.updateOne({ _id: req.params.id }, req.body);
        res.status(200).send(messageToClient(true, 'brand_updated', {}));

    } catch (error) {
        console.log(error)
        res.status(500).json(messageToClient(false, "internall_error", error.message));

    }

});

router.delete('/:id', vToken.verifyToken, isAdmin, async (req, res) => {
    try {

        await Brand.deleteOne({ _id: req.params.id });
        res.status(200).send(messageToClient(true, 'brand_updated', {}));

    } catch (error) {
        console.log(error)
        res.status(500).json(messageToClient(false, "internall_error", error.message));

    }

});
//router.delete('/:id',vToken.verifyToken,isAdmin, (req, res) => { });




module.exports = router;
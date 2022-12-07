let express = require('express')
let router = express.Router();
let User = require('../../model/User');
let messageToClient = require('../../utils/messages').messageToClient;
let lang=require('../../utils/lang');
let Value=require('../../model/Value')
router.get('/', async (req, res) => {
    try {
        let decoded = req.user;
        let user = await User.findOne({ username: decoded.username }).populate('favoritesProducts');
        let value = await Value.findOne();
        if(user&&user.favoritesProducts){
            user.favoritesProducts= lang.convertPriceArray(user.favoritesProducts,value.dollar)

        }
        if (user) {
            res.status(201).json(messageToClient(true, "favorites", user.favoritesProducts));
        } else {
            res.status(404).json(messageToClient(false, "user_not_found", {}));

        }
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
});
router.post('/', async (req, res) => {
    let decoded = req.user;

    try {
        let _id = req.body._id;
        console.log(_id)
        if (!_id) {
            return res.json(messageToClient(false, "_id_is_required", {}));
        }
        let user = await User.findOne({ username: decoded.username });
        let exist = false;
        for (var a = 0; a < user.favoritesProducts.length; a++) {
            if (user.favoritesProducts[a]+""===_id) { exist = true; break }
        }
        if (!exist) {
            user.favoritesProducts.push(_id)
            user.save();
        }

        res.status(200).send(messageToClient(true, 'favorite_product_added', {}));

    } catch (error) {
        console.log(error)
        res.status(500).json(messageToClient(false, "internall_error", error.message));
    }

});


router.delete('/:id', async (req, res) => {
    let decoded = req.user;

    try {
        let _id = req.params.id;
        if (!_id) {
            return res.json(messageToClient(false, "_id_is_required", {}));
        }
        let user = await User.findOne({ username: decoded.username });
        user.favoritesProducts.pull(_id)
        await user.save();
        res.status(200).send(messageToClient(true, 'favorite_product_updated', {}));

    } catch (error) {
        console.log(error)
        res.status(500).json(messageToClient(false, "internall_error", error.message));

    }

});
module.exports = router;
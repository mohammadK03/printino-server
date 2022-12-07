let express = require('express')
let router = express.Router();
let Property = require('../../model/Properties');
let messageToClient = require('../../utils/messages').messageToClient;
const vToken = require('../../utils/jwt')
const lang=require('../../utils/lang')

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
        let language=req.query.lang;
        let query={};
        let id = req.query.id ? req.query.id : null;
        query.parent = id;
        let properties = await Property.find(query).select('name color image parent');
        if(language){
            properties= lang.setLangs(properties,language,true)
          }else{
            properties= lang.setLangs(properties,language,false)
      
          }
        res.status(201).json(messageToClient(true, "properties", properties));
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
});
router.post('/', vToken.verifyToken, isAdmin, async (req, res) => {

    try {
        let property = new Property(req.body);
        await property.save();
        res.status(201).json(messageToClient(true, 'property_added', {}));

    } catch (error) {
        res.status(500).json(messageToClient(false, "internall_error", error.message));
    }

});
router.put('/:id', vToken.verifyToken, isAdmin, async (req, res) => {
    try {

        await Property.updateOne({ _id: req.params.id }, req.body);
        res.status(200).send(messageToClient(true, 'property_updated', {}));

    } catch (error) {
        console.log(error)
        res.status(500).json(messageToClient(false, "internall_error", error.message));

    }

});

router.delete('/:id', vToken.verifyToken, isAdmin, async (req, res) => {
    try {

        await Property.deleteOne({ _id: req.params.id });
        res.status(200).send(messageToClient(true, 'property_updated', {}));

    } catch (error) {
        console.log(error)
        res.status(500).json(messageToClient(false, "internall_error", error.message));

    }

});
//router.delete('/:id',vToken.verifyToken,isAdmin, (req, res) => { });




module.exports = router;
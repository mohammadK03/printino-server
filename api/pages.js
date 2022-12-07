let express = require('express')
let router = express.Router();
let Page = require('../model/Page');
let messageToClient = require('../utils/messages').messageToClient;
const vToken = require('../utils/jwt')
router.use('/:pageId/rows',require('./pages/rows'))

function isAdmin(req, res, next) {
    let decoded = req.user;
    if (decoded && decoded.role === "admin") {
        next();
    } else {
        res.statusCode = 403;
        res.json(messageToClient(false, "access_denied", {}));
    }
}

router.get('/', vToken.verifyToken, isAdmin, async (req, res) => {
    try {
        let page = await Page.find().select('url mode');
        res.status(201).json(messageToClient(true, "pages", page));
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
});

router.get('/:url',async (req, res) => {
    let mode=req.query.mode;
    let query={url:req.params.url}
    if(mode){
        query.mode=mode;
    }
    try {
        let page = await Page.findOne(query)
        .populate({
            path : 'rows',
            populate : {
              path : 'cols'
            }
          })
        
        res.status(201).json(messageToClient(true, "page", page));
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
});
router.post('/', vToken.verifyToken, isAdmin, async (req, res) => {
    
    try {
        let page=new Page(req.body);
        await page.save();
        res.status(201).json(messageToClient(true, 'page_added', {}));

    } catch (error) {
        res.status(500).json(messageToClient(false, "internall_error", error.message));
    }

});
router.put('/:id', vToken.verifyToken, isAdmin, async (req, res) => {
    try {

        await Page.updateOne({ _id: req.params.id }, req.body);
        res.status(200).send(messageToClient(true, 'page_updated', {}));

    } catch (error) {
        console.log(error)
        res.status(500).json(messageToClient(false, "internall_error", error.message));

    }

});

router.delete('/:id', vToken.verifyToken, isAdmin, async (req, res) => {
    try {

        await Page.deleteOne({ _id: req.params.id });

        
        res.status(200).send(messageToClient(true, 'page_deleted', {}));

    } catch (error) {
        console.log(error)
        res.status(500).json(messageToClient(false, "internall_error", error.message));

    }

});
//router.delete('/:id',vToken.verifyToken,isAdmin, (req, res) => { });




module.exports = router;
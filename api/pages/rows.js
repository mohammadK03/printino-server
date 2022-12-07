let express = require('express')
let router = express.Router({ mergeParams: true });
router.use('/:rowId/cols',require('./rows/cols'))

let Row = require('../../model/Row');
let Page = require('../../model/Page');
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

router.get('/', async (req, res) => {
    try {
     


        let rows = await Row.find({pageId:req.params.pageId});
        res.status(201).json(messageToClient(true, "rows", rows));
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
});
router.post('/', vToken.verifyToken, isAdmin, async (req, res) => {
    
    try {
        let page=await Page.findOne({_id:req.params.pageId});
        if(!page){
          return  res.status(404).json(messageToClient(false, "page_not_found", {}));

        }
        req.body.pageId=req.params.pageId;
        let row=new Row(req.body);
        await row.save();
        page.rows.push(row);
        await page.save();

        res.status(201).json(messageToClient(true, 'row_added', {}));

    } catch (error) {
        console.log(error)
        res.status(500).json(messageToClient(false, "internall_error", error.message));
    }

});
router.put('/:id', vToken.verifyToken, isAdmin, async (req, res) => {
    try {

        await Row.updateOne({ _id: req.params.id }, req.body);
        res.status(200).send(messageToClient(true, 'row_updated', {}));

    } catch (error) {
        console.log(error)
        res.status(500).json(messageToClient(false, "internall_error", error.message));

    }

});

router.delete('/:id', vToken.verifyToken, isAdmin, async (req, res) => {
    try {
        let page=await Page.findOne({_id:req.params.pageId});
        if(!page){
          return  res.status(404).json(messageToClient(false, "page_not_found", {}));

        }
        await Row.deleteOne({ _id: req.params.id });
        
        page.rows.pull(req.params.id);
        await page.save()
        res.status(200).send(messageToClient(true, 'row_deleted', {}));

    } catch (error) {
        console.log(error)
        res.status(500).json(messageToClient(false, "internall_error", error.message));

    }

});
//router.delete('/:id',vToken.verifyToken,isAdmin, (req, res) => { });




module.exports = router;
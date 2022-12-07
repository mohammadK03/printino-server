let express = require('express')
let router = express.Router({ mergeParams: true });

let Column = require('../../../model/Column');
let Row = require('../../../model/Row');

let messageToClient = require('../../../utils/messages').messageToClient;
const vToken = require('../../../utils/jwt')


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
     
        let columns = await Column.find({rowId:req.params.rowId});
        res.status(201).json(messageToClient(true, "columns", columns));
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
});
router.post('/', vToken.verifyToken, isAdmin, async (req, res) => {
    
    try {
        let row=await Row.findOne({_id:req.params.rowId});
        if(!row){
          return  res.status(404).json(messageToClient(false, "row_not_found", {}));

        }
        req.body.rowId=req.params.rowId;
        let column=new Column(req.body);
        await column.save();
        row.cols.push(column);
        await row.save();

        res.status(201).json(messageToClient(true, 'column_added', {}));

    } catch (error) {
        res.status(500).json(messageToClient(false, "internall_error", error.message));
    }

});
router.put('/:id', vToken.verifyToken, isAdmin, async (req, res) => {
    try {

        await Column.updateOne({ _id: req.params.id }, req.body);
        res.status(200).send(messageToClient(true, 'column_updated', {}));

    } catch (error) {
        console.log(error)
        res.status(500).json(messageToClient(false, "internall_error", error.message));

    }

});

router.delete('/:id', vToken.verifyToken, isAdmin, async (req, res) => {
    try {
        let row=await Row.findOne({_id:req.params.rowId});
        if(!row){
          return  res.status(404).json(messageToClient(false, "row_not_found", {}));

        }
        await Column.deleteOne({ _id: req.params.id });
        
        row.cols.pull(req.params.id);
        await row.save()
        res.status(200).send(messageToClient(true, 'column_deleted', {}));

    } catch (error) {
        console.log(error)
        res.status(500).json(messageToClient(false, "internall_error", error.message));

    }

});
//router.delete('/:id',vToken.verifyToken,isAdmin, (req, res) => { });




module.exports = router;
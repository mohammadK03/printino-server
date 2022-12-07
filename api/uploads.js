const multer = require('multer');
const path = require('path');
let messageToClient = require('../utils/messages').messageToClient;
let uuid = require('uuid');
let fs = require('fs');
let Upload = require('../model/Uploads');
const express = require('express');
var router = express.Router();
const vToken = require('../utils/jwt');


router.use('/', vToken.verifyToken, async (req, res, next) => {
  let decoded = req.user;
  if (decoded && decoded.role === "admin" ||decoded.role === "seller") {
    next();
  } else {
    res.statusCode = 403;
    res.json({ success: false, message: 'access_denied' });
  }
});
const fileUpload = multer({
  storage: new multer.diskStorage({
    destination: global.uploadAddress,
    filename: function (req, file, callback) {
      let randomName = uuid.v4();
      if (file) {
        var ext = path.extname(file.originalname);

        callback(null, randomName + ext);

      } else {
        return callback(new Error('file_required'))

      }
    }
  }),
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.mp4' && ext !== '.jpeg') {
      return callback(new Error('only_image_and_video_allow_upload'))
    }
    callback(null, true)
  },
  limits: { fileSize: 20 * 1024 * 1024 }
});



router.post('/', fileUpload.single('image'), async (req, res) => {
  // let decoded = req.user;
  if (req.file) {


    let path = 'uploads/' + req.file.filename;
    try {
      let upload = new Upload({ url: path });
      await upload.save();
      return res.send(messageToClient(true, "file_is_added", { url: path, id: upload._id }))
    } catch (error) {
      fs.unlinkSync(req.file.path);
      return res.send(messageToClient(false, "internall_error", {}))

    }


  } else {
    return res.send(messageToClient(false, "file_is_require", {}))
  }

})


router.get('/', async (req, res) => {
  const page = req.query.page;
  let options = {
    page: 1,
    limit: 20,
    select: " -createdAt -updatedAt -__v",
    sort:{createdAt: -1}
  };
  if (page && page < 1) {
    options.page = 1;
  } else {
    options.page = page;
  }
  let uploads = await Upload.paginate({}, options);
  res.json(messageToClient(true, "uploads", uploads));


});

router.put('/', async(req, res) => {
  let alt = req.body.alt;
  let _id = req.body._id;
  if (!_id) {
    return res.json(messageToClient(false, "_id_is_required", {}));
  }
  if (!alt) {
    return res.json(messageToClient(false, "alt_is_required", {}));
  }
  try {
    await Upload.updateOne({_id},{alt});
    return res.json(messageToClient(true, "updated", {}));

  } catch (error) {
    console.log(error)

    res.statusCode=500;
    return res.json(messageToClient(false, "internall_error", {}));

  }


});
router.delete('/', vToken.verifyToken, async (req, res, next) => {
  let decoded = req.user;
  if (decoded && decoded.role === "admin") {
    next();
  } else {
    res.statusCode = 403;
    res.json({ success: false, message: 'access_denied' });
  }
});
router.delete('/:id',async (req, res) => {
  let _id = req.params.id;
  if (!_id) {
    return res.json(messageToClient(false, "_id_is_required", {}));
  }
  try {
    let upload=await Upload.findById(_id);
    if(!upload){
      return res.json(messageToClient(false, "file_not_found", {}));

    }
    await Upload.deleteOne({_id});
    try {
      fs.unlinkSync(global.publicAddress+upload.url);

    } catch (error) {
      return res.json(messageToClient(true, "document_deleted_and_file_not_found", {}));

    }
    return res.json(messageToClient(true, "deleted", {}));

  } catch (error) {
    console.log(error)

    res.statusCode=500;
    return res.json(messageToClient(false, "internall_error", {}));
  }
});



module.exports = router;
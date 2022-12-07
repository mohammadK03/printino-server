var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('./setting');
require('./utils/dbConnector').connect();
var cors = require('cors')
let vToken=require('./utils/jwt')
var app = express();

let resize=require('./utils/resize');
app.use(cors())
var whitelist = ['https://karun.io', 'https://admin.karun.io'];
app.all("*", (req, res, next) => {
    var origin = req.headers.origin;
    if (whitelist.indexOf(origin) != -1) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Headers", ["Content-Type","X-Requested-With","X-HTTP-Method-Override","Accept"]);
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Methods", "GET,POST");
    res.header("Cache-Control", "no-store,no-cache,must-revalidate");
    res.header("Vary", "Origin");
    if (req.method === "OPTIONS") {
    res.status(200).send("");
      return;
    }
    next();
});
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set('view engine', 'ejs');


app.get('/uploads/*', function (req, res, next) {
  let mpath = req.path;
  var ext =getExtension(mpath);
  let width = Number(req.query.width);
  let height = Number(req.query.height);
  let quality = Number(req.query.quality);
  if (width > 1920) {
    res.json(messageToClient(false, 'max_width_1920', {}));
    return 0;

  }
  if (height > 1080) {
    res.json(messageToClient(false, 'max_height_1080', {}));
    return 0;

  }
  if (quality > 100) {
    res.json(messageToClient(false, 'max_quality_100', {}));
    return 0;

  }
  if (!height) {
    height = null;
  }
  if (!width) {
    width = null;
  }
  if (!quality) {
    quality = 100;
  }
  
  if (ext === 'jpg' || ext === 'gif' || ext === 'jpeg' || ext === "png") {
    res.type(`image/${ext}`)
    try {
      resize(global.publicAddress + mpath,ext, width, height,res)
      .pipe(res)

    } catch (error) {
      res.send()
      console.log(error)
    }
  } else {
    next()

  }

});
function getExtension(filename) {
  var ext = path.extname(filename||'').split('.');
  return ext[ext.length - 1];
}
function getExtension(filename) {
  var ext = path.extname(filename||'').split('.');
  return ext[ext.length - 1];
}
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./api/index'));
app.use('/api/pages', require('./api/pages'));

app.use('/api/users', require('./api/users'));
app.use('/api/admins', require('./api/admins'));
app.use('/api/categories', require('./api/categories'));
app.use('/api/uploads', require('./api/uploads'));
app.use('/api/brands', require('./api/brands'));
app.use('/api/users', require('./api/users'));
app.use('/api/products', require('./api/products'));
app.use('/api/sellers/orders',vToken.verifyToken, require('./api/sellers/orders'));

app.use('/api/sellers', require('./api/sellers'));
app.use('/api/sellers/register', require('./api/sellers/register'));
app.use('/api/confirmers', require('./api/confirmers'));


module.exports = app;

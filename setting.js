const path = require('path');
global.publicAddress=path.join(process.cwd(), '/public/');

global.uploadAddress=path.join(process.cwd(), '/public/uploads');
global.uploadAddressFiles=path.join(process.cwd(), '/public/uploads/files');
if(process.env.DB){
    console.log("db address: "+ process.env.DB)
}else{
    console.log("db address: default")
}
global.mongodbConnectionAddress=process.env.DB || 'mongodb://localhost:27017/alfurat';

// global.JWTpublicKeyAddress =path.join(process.cwd(),  'keys/jwt/public.key')
// global.JWTprivateKeyAddress = path.join(process.cwd(), 'keys/jwt/private.key')
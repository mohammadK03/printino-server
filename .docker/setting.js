const path = require('path');
global.publicAddress=path.join(process.cwd(), '/public/');
global.uploadAddress=path.join(process.cwd(), '/public/uploads');

global.uploadAddressFiles=path.join(process.cwd(), '/public/uploads/files');
global.mongodbConnectionAddress='mongodb://tty:mytestPass@db:27017?authMechanism=DEFAULT';

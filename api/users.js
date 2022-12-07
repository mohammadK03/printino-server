var express = require('express');
var router = express.Router();
const User = require('../model/User');
const hash = require('password-hash');

const vToken = require('../utils/jwt')
const messageToClient = require('../utils/messages').messageToClient;
const sendSms = require('../utils/messages').sendSms;
const mail =require('../utils/mail');
const generateNumber = require('../utils/generate');
const jwt = require('jsonwebtoken');

router.use('/favorites',vToken.verifyToken,require('./users/favorites'));

router.use('/carts',vToken.verifyToken,require('./users/carts'));
router.use('/addresses',vToken.verifyToken,require('./users/addresses'));
router.use('/orders',require('./users/orders'));

router.get('/', vToken.verifyToken, async function (req, res, next) {
    let decoded = req.user;
    if (decoded && decoded.role === "admin") {
        const page = req.query.page;
        let options = {
            page: 1,
            limit: 10,
            select: "-password -createdAt -updatedAt -__v",
        };
        if (page && page < 1) { options.page = 1 } else { options.page = page; }
        const users = await User.paginate({}, options);
        res.json(users);

    } else if (decoded.role === "user") {

        const user = await User.findById(decoded.id).select('-password');
        res.json(user);
    } else {
        res.statusCode = 403;
        res.json({ success: false, message: 'access_denied' });

    }

});
router.get('/:id', vToken.verifyToken, async function (req, res, next) {
    let decoded = req.user;
    if (decoded && decoded.role === "admin") {

        try {
            let user = await User.findById(req.params.id)
            res.json(user);

        } catch (error) {
            res.statusCode = 500;
            res.json({ success: false, message: 'internal_error' });
            console.error(error)
        }

    } else {
        res.statusCode = 403;
        res.json({ success: false, message: 'access_denied' });

    }

});

router.post('/', vToken.verifyToken, async function (req, res, next) {
    let decoded = req.user;
    if (decoded && decoded.role === "admin") {
        try {
            let body = req.body;
            if (body.password) {
                body.password = await hash.generate(body.password);
            }
            let user = new User(req.body);
            await user.save();
            res.json({ success: true, message: 'ok_add' });

        } catch (error) {
            res.statusCode = 500;
            res.json({ success: false, message: 'internal_error' });
            console.error(error)
        }

    } else {
        res.statusCode = 403;
        res.json({ success: false, message: 'access_denied' });

    }


});

router.put('/:id', vToken.verifyToken, async function (req, res, next) {
    let decoded = req.user;
    try {
        if (decoded.role === "admin") {
            try {
                let body = req.body;
                if (body.password) {
                    body.password = await hash.generate(body.password);
                }
                await User.updateOne({ _id: req.params.id }, body)

                res.json({ success: true, message: 'ok_edited' });

            } catch (error) {
                res.statusCode = 500;
                res.json({ success: false, message: 'internal_error' });
                console.error(error)
            }
        } else {
            res.statusCode = 403;
            res.json({ success: false, message: 'access_denied' });

        }

    } catch (error) {
        console.log(error);
        res.send(error)
    }
});
router.put('/', vToken.verifyToken, async function (req, res, next) {
    let decoded = req.user;

    if (decoded && decoded.role === "user") {
        try {
            let body = {};

            if (req.body.name) {
                body.name = req.body.name;
            }
            if (req.body.lastname) {
                body.lastname = req.body.lastname;

            }
            if (req.body.address) {
                body.address = req.body.address;

            }
        
            if (req.body.email) {
                body.email = req.body.email;

            }
         
            if (req.body.sex) {
                body.sex = parseInt(req.body.sex);

            }
          
            if (req.body.birthDate) {
                body.birthDate = req.body.birthDate;

            }
            if (req.body.password) {
                body.password = await hash.generate(req.body.password);
            }
            await User.updateOne({ _id: decoded.id }, body);

            res.json({ success: true, message: 'ok_edited' });

        } catch (error) {
            res.statusCode = 500;
            res.json({ success: false, message: 'internal_error' });
            console.error(error)
        }
    } else {
        res.statusCode = 403;
        res.json({ success: false, message: 'access_denied' });

    }


});

router.delete('/:id', vToken.verifyToken, async function (req, res, next) {
    let decoded = req.user;

    if (decoded && decoded.role === "admin") {
        try {
            await User.deleteOne({ _id: req.params.id });
            res.json({ success: true, message: 'ok_deleted' });
        } catch (error) {
            res.statusCode = 500;
            res.json({ success: false, message: 'internal_error' });
            console.error(error)
        }
    } else {
        res.statusCode = 403;
        res.json({ success: false, error: 'access_denied' });

    }


});



router.get('/auth/emailverification', async (request, response) => {
    let email = request.query.email;
   

    let userExist = false;
    var password = generateNumber.getRandomIntInclusive(1000, 9999);
    let findResult = await User.findOne({ email });
    var hashPassword = await hash.generate(password + "");
    console.log(password)
    if (findResult) {
        var now = Date.now();
        try {
           await mail.sendVerifyCode(email,password)
           
            await User.findOneAndUpdate({ email }, { verifyCode: hashPassword, LastSendSmsVerificationTime: now }, { new: false }).exec();

            response.send(messageToClient(true, 'username', { username: findResult.username }));
        } catch (error) {
            response.send(messageToClient(false, 'username', {}));
        }

    } else {
        var username;
        do {
            username = "users" + generateNumber.getRandomIntInclusive(99999999, 9999999999);
            let findResult = await User.findOne({ username })
            if (findResult) {
                userExist = true;
            } else {
                userExist = false;
            }
        } while (userExist);
        await mail.sendVerifyCode(email,password)

        let dataModel = new User({
            username,
            verifyCode: hashPassword,
            email,
            sex: -1,
            role: "user",
        });

        await dataModel.save();
        response.send(messageToClient(true, '', { username }));
    }

});




router.post('/auth/login', async (request, response) => {
    var username = request.body.username;
    var password = request.body.password;
    let loginMode = request.query.loginmode;
    if (!loginMode) {
        loginMode = 0;
    }
    if (loginMode == 1) {
        if (username) {
            let index0 = username.indexOf(0);
            if (index0 == 0) {
                username = username.substring(1);
            }
        }
    }

    let findResult;
    let dbPassword;
    if (username && password) {

        if (loginMode == 0) {
            findResult = await User.findOne({ username });
            if(!findResult){
              return  response.send(messageToClient(false, 'login_failed', {}));

            }
            dbPassword=findResult.verifyCode;
        } else {
            findResult = await User.findOne({ email: username });
            dbPassword=findResult.password;

        }

        if (findResult) {

            
            if (await hash.verify( password,dbPassword)) {

                try {
                    const token = jwt.sign({ username: findResult.username,uniqueCode: findResult.uniqueCode,  role: 'user', id: findResult._id, type: 'token' }, vToken.JWTprivateKey, { expiresIn: '30d', algorithm: 'RS256' });
                    const refreshToken = jwt.sign({ username: findResult.username,uniqueCode: findResult.uniqueCode, id: findResult._id, role: 'user', type: 'refresh' }, vToken.JWTprivateKey, { expiresIn: '60d', algorithm: 'RS256' });
                    const packet = {
                        "token": "bearer " + token,
                        "refreshToken": "bearer " + refreshToken,
                    }

                    response.send(messageToClient(true, 'token_refreshToken', packet));


                    //  response.json(packet);
                } catch (e) {
                    console.log(e)
                    //  response.send({ success: false, error: 'auth_failed' });
                    response.send(e)
                }


            } else {
                response.send(messageToClient(false, 'login_failed', {}));

                //     response.send({ success: false, error: 'login_failed' });
            }
        } else {
            response.send(messageToClient(false, 'user_not_find', {}));

            // response.send({ success: false, error: 'user_not_find' });
        }

    } else {
        response.send(messageToClient(false, 'username_or_password_not_exist', {}));

        //  response.send({ success: false, error: 'username_or_password_not_exist' });
    }

});


module.exports = router;
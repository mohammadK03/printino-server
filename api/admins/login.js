const jwt = require('jsonwebtoken');
const vToken = require('../../utils/jwt')
const Admin = require('../../model/Admin');
const hash = require('password-hash');
const messageToClient = require('../../utils/messages').messageToClient;

var express = require('express');
var router = express.Router();
router.post('/', async (request, response) => {
    var username = request.body.username;
    var password = request.body.password;
    if (username && password) {
        const findResult = await Admin.findOne({ username });
        if (findResult) {
            const passwordInDb = findResult.password;
            if (hash.verify(password, passwordInDb)) {
                try {
                    const token = jwt.sign({ username, role: findResult.role, type: 'token',id:findResult._id }, vToken.JWTprivateKey, { expiresIn: '1d', algorithm: 'RS256' });
                    const refreshToken = jwt.sign({ username, role: findResult.role, type: 'refresh',id:findResult._id  }, vToken.JWTprivateKey, { expiresIn: '2d', algorithm: 'RS256' });
                    const packet = {
                        "token": "bearer " + token,
                        "refreshToken": "bearer " + refreshToken,
                    }
                    response.send(messageToClient(true,"login_admin",packet));
                } catch (e) {
                    response.send({ success: false, error: 'auth_failed' });

                }
            } else {
                response.send({ success: false, error: 'login_failed' });
            }
        } else {
            response.send({ success: false, error: 'user_not_find' });
        }

    } else {
        response.send({ success: false, error: 'username_or_password_not_exist' });
    }

});

module.exports=router;
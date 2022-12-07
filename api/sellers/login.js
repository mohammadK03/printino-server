var express = require('express');
var router = express.Router();
const Seller = require('../../model/Seller');
const hash = require('password-hash');
const vToken = require('../../utils/jwt')
const jwt = require('jsonwebtoken');
const messageToClient=require('../../utils/messages').messageToClient
router.post('/', async (request, response) => {
    var username = request.body.username;
    var password = request.body.password;
    if (username && password) {

        const findResult = await Seller.findOne({ username });
        if (findResult && findResult.isActive) {
            const passwordInDb = findResult.password;

            if (hash.verify(password, passwordInDb)) {
                try {
                    const token = jwt.sign({ username, role:"seller", type: 'token', id: findResult._id }, vToken.JWTprivateKey, { expiresIn: '30d', algorithm: 'RS256' });
                    const refreshToken = jwt.sign({ username, role: "seller", type: 'refresh', id: findResult._id }, vToken.JWTprivateKey, { expiresIn: '60d', algorithm: 'RS256' });
                    const packet = {
                        "token": "bearer " + token,
                        "refreshToken": "bearer " + refreshToken,
                    }
                    response.send(messageToClient(true,"login",packet));
                } catch (e) {
                    response.send({ success: false, message: 'internal_error' });

                }
            } else {
                response.send({ success: false, message: 'login_failed' });
            }
        } else {
            response.send({ success: false, message: 'user_not_find' });
        }

    } else {
        response.send({ success: false, message: 'username_or_password_not_exist' });
    }

});
module.exports = router;
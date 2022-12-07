const request = require('request');

module.exports.messageToClient=function(success,message,body={}){
    return {success,message,body}
}

module.exports.sendSms=function(phoneNumber, text){
    
        const trezUsername = 'menuonline';
        const trezPassword = '2392020';    
        var options = {
            method: 'GET',
            uri: `http://smspanel.Trez.ir/SendMessageWithUrl.ashx?Username=${trezUsername}&Password=${trezPassword}&PhoneNumber=50002910001080&MessageBody=${encodeURIComponent(text)}&RecNumber=${phoneNumber}`,
        };
    
        return new Promise(function (resolve, reject) {
            request(options, function (error, res, body) {
                
                if (!error && res.statusCode == 200) {
                    resolve(body);
                } else {
                    reject(error);
                }
            });
        });
    
}
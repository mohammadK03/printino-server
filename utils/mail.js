
var nodemailer = require('nodemailer');

const email = "alfuorat.io@gmail.com";
var ejs = require("ejs");

module.exports.sendVerifyCode =async function (to,code) {
    const subject="verification code"
    let html= await ejs.renderFile(process.cwd()+"/views/emailveryfication.ejs", { code: code });

    this.send(to,subject,html)
}


module.exports.send = function (to, subject, html) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: email,
            pass: 'Net@231@231'
        }
    });

    var mailOptions = {
        from: email,
        to: to,
        subject: subject,
        html: html
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

}
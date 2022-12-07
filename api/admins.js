const hash = require('password-hash');
const Admin = require('../model/Admin');
const vToken = require('../utils/jwt')

var express = require('express');
var router = express.Router();
router.use('/login',require('./admins/login'))
router.post('/', vToken.verifyToken, async (request, response) => {
    const decoded = request.user;
    try {
        const role = decoded.role;
        if (role === "admin") {
            var username = request.body.username;
            var password = request.body.password;
            const findResult = await Admin.findOne({ username });

            if (!findResult) {
                if (username && password) {
                    password = hash.generate(password);

                    try {
                        const admin = new Admin({
                            username,
                            password,
                            role: "admin",
                        });

                        await admin.save();
                        response.send({ success: true, message: 'add_user' });
                    } catch (error) {
                        //    response.send { success: false, error: 'error_in_database' };
                        response.send(error);
                    }


                } else {
                    response.send({ success: false, error: 'username_or_password_not_exist' });

                }
            } else {
                response.send({ success: false, error: 'username_is_exist' });

            }

        } else {
            response.send({ success: false, error: 'access_denied' });

        }

    } catch (err) {
        response.send({ success: false, error: 'AUTHORIZED_ERROR' });
        //console.log(err)
    }


});

router.put('/', vToken.verifyToken, async (request, response) => {
    const decoded = request.user;

    try {
        const _id = request.query.id;
        const role = decoded.role;
        if (_id) {


            if (role === "admin") {
                try {
                    await Admin.findOneAndUpdate({ _id }, request.body, { new: false });
                    response.send({ success: true, error: 'user_edited' });
                } catch (error) {
                    response.send(error);


                }

            } else {
                response.send({ success: false, error: 'access_denied' });

            }
        } else {
            response.send({ success: false, error: 'id_not_exist' });

        }
    } catch (err) {
        response.send({ success: false, error: 'AUTHORIZED_ERROR' });
        //console.log(err)
    }


});


router.get('/', vToken.verifyToken, async (request, response) => {
    const decoded = request.user;
  
    if (decoded) {
     
        const role = decoded.role;
        // console.log(decoded)

        try {
            if (role === "admin") {
                const page = request.query.page;
                let options = {
                    page: 1,
                    limit: 10,
                    select:"-password -createdAt -updatedAt -__v",
                    
                };
                if (page && page < 1) {
                    options.page = 1;
                }else{
                    options.page = page;
                }
                //const adminUsers= await Admin.find().select("-password");
                //response.send(adminUsers);

                try {
                    const adminUsers = await Admin.paginate({}, options);
                    //   console.log(adminUsers)
                    if (adminUsers.docs) {
                        response.json(adminUsers.docs);

                    } else {
                        response.json(adminUsers);

                    }

                } catch (error) {
                    response.send(error);

                }


            } else {
                response.send({ success: false, error: 'access_denied' });

            }

        } catch (err) {
            response.send(err);
            //console.log(err)
        }
    } else {
        response.send({ success: false, error: 'access_denied' });

    }



});


router.delete('/', vToken.verifyToken, async (request, response) => {
    const decoded = request.user;

    try {
        const _id = request.query.id;
        const role = decoded.role;
        if (role === "admin") {
            try {
                await Admin.deleteOne({ _id });
                response.send({ success: true, error: 'user_deleted' });
            } catch (error) {
                response.send(error);


            }

        } else {
            response.send({ success: false, error: 'access_denied' });

        }

    } catch (err) {
        response.send({ success: false, error: 'AUTHORIZED_ERROR' });
        //console.log(err)
    }


});


// router.post('/add', async (request, response) => {
//     var username = request.body.username;
//     var password = request.body.password;
//     const findResult = await Admin.findOne({ username });
//     if (!findResult) {
//         if (username && password) {
//             password = hash.generate(password);
//             //console.log(hashedPassword);
//             try {
//                 const admin = new Admin({
//                     username,
//                     password,
//                     role: "admin",
//                 });

//                 await admin.save();
//                 response.json({ success: true, message: 'add_user' });
//             } catch (error) {
//                 //    return { success: false, error: 'error_in_database' };
//                 response.json(error);
//             }


//         } else {
//             response.json({ success: false, error: 'username_or_password_not_exist' });

//         }
//     } else {
//         response.json({ success: false, error: 'username_is_exist' });

//     }

// });





module.exports = router;



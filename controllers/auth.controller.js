const db = require('../models');
const User = db.user;
const Type = db.accountType;
const Role = db.role;
const Op = db.Sequelize.Op;
var jwt = require("jsonwebtoken");
const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const cookieParser = require("cookie-parser");
const app = express();
const alert = require('alert-node');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const config = require("../config/auth.config");
const flash = require('connect-flash');
app.use(flash());
app.use(cookieParser);
const excel = require('exceljs');
const bcrypt = require('bcryptjs');
const { accountType, role } = require('../models');
const { jsPDF } = require('jspdf');
const autoTable = require('jspdf-autotable');
const nodemailer = require('nodemailer');
const uuid = require('uuid');
const readXlsxFile = require('read-excel-file/node');
const { createResetRequest, getResetRequest } = require('../models/resetRequests');

app.use(session({
    key: "user_sid",
    secret: "somerandonstuffs",
    resave: false,
    saveUninitialized: true

}));
/**
 * @swagger
 * components:
 *  schemas:
 *      User:
 *          type: object
 *          required:
 *               - username
 *               - password
 *               - address
 *               - phone_number
 *               - accountType
 *          properties:
 *               username:
 *                   type: string
 *                   description: Username of user
 *               password:
 *                   type: password
 *                   description: The User password
 *               address:
 *                   type: string
 *                   description: The user address
 *               phone_number:
 *                   type: string
 *                   description: the user phone number
 *               accountType:
 *                   type: string
 *                   description: the user account type
 *          example:
 *               username: syam prasad
 *               password: *****
 *               address: Hyderabad
 *               phone_number: 234567898
 *               accountType: user
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: The user managing API
 */

exports.signup = (req, res, next) => {
    req.session.isLoggedIn = true;
    User.create({
        username: req.body.name1,
        address: req.body.address,
        password: bcrypt.hashSync(req.body.pass1),
        phone_number: req.body.phone,
        accountType: req.body.types,
        roleType: req.body.roles,
        email: req.body.mail
    }).then(user => {
        if (req.body.types) {
            Type.findAll({
                where: {
                    accountType: req.body.types
                }


            }).then(type => {
                Role.findAll({
                    where: {
                        roleType: req.body.roles
                    }
                }).then(role => {

                    user.setAccountTypes(type).then(() => {
                        user.setRole(role[0].dataValues.id).then(() => {
                            req.session.roleType = role[0].dataValues.roleType;
                            req.session.user = user.username;
                            req.session.save();
                            return res.render('dashboard', {
                                username: req.body.name1,
                                roleType: req.session.roleType
                            });

                        });



                    });
                });

            });


        }

    }).catch(err => {
        res.status(400).send({ message: err.message });
    });

};
exports.signIn = (req, res, next) => {

    let userName = req.body.name;
    User.findOne({
        where: {
            username: userName
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        if (bcrypt.compareSync(req.body.pass, user.password)) {
            req.session.isLoggedIn = true;
            req.session.user = userName;
            console.log('name ===' + req.session.user);

            res.render('dashboard', { username: userName });

            var token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: 86400 // 24 hours
            });
            console.log('token========' + token);
            var authorities;
            user.getRole().then(roles => {
                console.log('roles========' + roles.dataValues.roleType);
                authorities = roles.dataValues.roleType;
                req.session.roleType = authorities;
                req.session.save();

            }).catch(err => {
                res.status(500).send({ message: err.message });
            });
        } else {
            req.flash('error', "Wrong Password");
            res.redirect('/login');
        }
    });
};
exports.accountDetails = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    var roleType = req.session.roleType;
    const user1 = req.session.user;

    console.log(user1);
    User.findOne({
            where: {
                username: user1
            }
        })
        .then(user2 => {
            if (user2) {


                res.render('accountDetails', {
                    customer: user2,
                    roleType: roleType
                });
            }
            next();
        }).catch(err => {
            if (err) {
                console.log(err);
            }
        });
};
exports.DeleteUser = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    const userId = req.params.user1;
    console.log('user===========================' + userId);
    console.log("user row to delete" + userId);
    User.findByPk(userId).then(user1 => {
        return user1.destroy();
    }).then(() => {
        console.log("product deleted");
        res.status(200).redirect('/login');
    });
};
exports.getEditUser = (req, res, next) => {

    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    var roleType = req.session.roleType;
    console.log('role======' + roleType);
    const editMode = req.query.edit;
    console.log(editMode);
    if (!editMode) {
        return res.render('dashboard', { username: req.params.user2 });
    }
    const user1 = req.params.user2;
    console.log(user1);
    User.findAll({
        where: {
            username: user1
        }
    }).then(User => {
        Type.findAll().then(Roletype => {

            res.render('editAccount', {
                editing: editMode,
                user: User,
                type: Roletype,
                roleType: roleType,
                isAuthenticated: req.session.isLoggedIn
            });

        });
    }).catch(err => {
        res.send(err);
    });
};
exports.withdraw = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    var roleType = req.session.roleType;
    const user1 = req.params.user;
    const withdrawAmount = req.body.withdrawAmount;
    User.findOne({
        where: {
            username: user1
        }
    }).then(user => {
        var userBalance = user.balance;
        console.log(userBalance);

        console.log(withdrawAmount);
        if (userBalance >= withdrawAmount) {
            user.balance = userBalance - withdrawAmount;
            user.save();
            return res.render('accountDetails', { customer: user, roleType: roleType });


        } else {
            res.send({ message: 'Insufficient Funds' });
        }
        next();
    });

};
exports.deposit = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    var roleType = req.session.roleType;
    const user1 = req.params.user;
    const depositAmount = parseInt(req.body.depositAmount);
    User.findOne({
        where: {
            username: user1
        }
    }).then(user => {
        var userBalance = user.balance;
        console.log(userBalance);
        console.log(depositAmount);
        user.balance = userBalance + depositAmount;
        user.save();
        return res.render('accountDetails', { customer: user, roleType: roleType });
    });
};
exports.postEditUser = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    var roleType = req.session.roleType;
    const updatedPassword = bcrypt.hashSync(req.body.password);
    const updatedAddress = req.body.address;

    console.log('password==============' + updatedPassword);
    console.log('user==================' + req.session.user);
    if (req.body.password == '') {
        res.send({ message: 'Please enter password' });
    } else if (updatedAddress == '') {
        res.send({ message: 'Please enter address' });
    }
    User.findOne({
        where: {
            username: req.session.user
        }
    }).then(User2 => {
        User2.password = updatedPassword;
        User2.address = updatedAddress;

        User2.save();
        return res.render('accountDetails', { customer: User2 });
    }).catch(err => {
        console.log(err);
    });
};
exports.getIndex = (req, res, next) => {
    var roleType = req.session.roleType;
    Type.findAll().then(type => {
        Role.findAll().then(role => {
            res.render('index', {
                type: type,
                role: role
            });
        });


    });


};

exports.downloadFile = (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    var roleType = req.session.roleType;
    var user = req.params.user;
    User.roleType = roleType;
    User.findAll().then(objects => {
        var customers = [];
        let length = objects.length;

        for (let i = 0; i < length; i++) {
            let datavalues = objects[i].dataValues;
            let customer = {
                id: datavalues.id,
                username: datavalues.username,
                address: datavalues.address,
                phone_number: datavalues.phone_number,
                balance: datavalues.balance,
                accountType: datavalues.accountType

            };
            customers.push(customer);
        }

        console.log(customers);

        const jsonCustomers = JSON.parse(JSON.stringify(customers));

        let workbook = new excel.Workbook(); //creating workbook
        let worksheet = workbook.addWorksheet('Customers'); //creating worksheet

        worksheet.columns = [
            { header: 'Id', key: 'id', width: 10 },
            { header: 'Name', key: 'username', width: 30 },
            { header: 'Address', key: 'address', width: 30 },
            { header: 'Phone Number', key: 'phone_number', width: 30 },
            { header: 'Account type', key: 'accountType', width: 30 },
            { header: 'Balance', key: 'balance', width: 30 },

        ];

        // Add Array Rows
        worksheet.addRows(jsonCustomers);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'customer.xlsx');

        return workbook.xlsx.write(res)
            .then(function() {
                res.status(200).end();
            });
    });
};
exports.sendMoney = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    var roleType = req.session.roleType;
    const senderNumber = req.params.number;
    const receiverNumber = req.body.number;
    const sendingAmount = parseInt(req.body.Amount);
    User.findOne({
        where: {
            phone_number: receiverNumber
        }
    }).then(receiver => {
        if (!receiver) {
            res.send({ message: `No account is linked with ${receiverNumber}` });
        } else {
            const receiverBalance = (receiver.balance);
            receiver.balance = receiverBalance + sendingAmount;
            receiver.save();
        }
    }).then(() => {
        User.findOne({
            where: {
                phone_number: senderNumber
            }
        }).then(sender => {
            var userBalance = sender.balance;
            console.log(userBalance);
            if (userBalance >= sendingAmount) {
                sender.balance = userBalance - sendingAmount;
                sender.save();
                res.redirect('/accountDetails');
            } else {
                res.send({ message: 'Insufficient Funds' });
            }
        });
    });

};
exports.uploadFile = (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    var roleType = req.session.roleType;
    User.roleType = roleType;
    try {
        let filePath = __basedir + "/uploads/" + req.file.filename;

        readXlsxFile(filePath).then(rows => {
            // `rows` is an array of rows
            // each row being an array of cells.   
            console.log(rows);

            // Remove Header ROW
            rows.shift();

            const customers = [];

            let length = rows.length;

            for (let i = 0; i < length; i++) {

                let customer = {

                    username: rows[i][1],
                    address: rows[i][2],
                    phone_number: rows[i][3],
                    email: rows[i][4],
                    accountType: rows[i][5]
                };
                customers.push(customer);
            }

            User.bulkCreate(customers).then(() => {
                const result = {
                    status: "ok",
                    filename: req.file.originalname,
                    message: "Upload Successfully!",
                };
                res.json(result);
            }).catch((err) => { console.log(err); });
        });
    } catch (error) {
        const result = {
            status: "fail",
            filename: req.file.originalname,
            message: "Upload Error! message = " + error.message
        };
        res.json(result);
    }
};
exports.getpdfgenerator = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    var roleType = req.session.roleType;
    const customer = req.session.user;
    console.log('customer=========' + customer);

    User.findAll().then(user => {

        const doc = new jsPDF();
        const jsonUser = JSON.parse(JSON.stringify(user));
        console.log("userpdf======" + jsonUser);
        var rowData = [];
        for (var i = 0; i < jsonUser.length; i++) {
            let element = [];

            element.push(String(jsonUser[i].id), jsonUser[i].username, jsonUser[i].email, jsonUser[i].address, jsonUser[i].accountType, jsonUser[i].phone_number);
            rowData.push(element);
        }
        const tablestyle = {
            styles: { fillColor: [0, 184, 230], textColor: [26, 26, 26] },
            columnStyles: { 0: { halign: 'center', fillColor: [255, 10, 10] } }, // Cells in first column centered and green
            margin: { top: 10 },
            head: [
                ['ID', 'Username', 'Email Id', 'Address', 'Account Type', 'Mobile number']
            ],
            body: rowData
        };

        doc.autoTable(tablestyle);
        doc.save('./resource/user.pdf');
        req.flash('success', 'PDF Generate Successfuly');
        res.render('accountDetails', {
            customer: customer,
            roleType: roleType
        });



    }).catch(err => {
        console.log(err);
    });

};
exports.sendMail = (req, res) => {
    const email = req.body.name2;
    const id = uuid.v1();
    const request = { id, email };
    User.findOne({
        where: {
            email: email
        }
    }).then(user => {
        createResetRequest(request);
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'syamturlapati@gmail.com',
                pass: 'Syam@1997'
            }
        });
        let mailContent = {
            from: 'Sender Name<syam>',
            to: email,
            subject: 'Password Reset',
            text: `To reset your password click on this link: http://localhost:4010/reset/${id}`
        };
        transporter.sendMail(mailContent);
        res.send({ 'Status': 'OK' });
    }).catch((err) => {
        res.send({ 'status': 'ok' });
    });
};
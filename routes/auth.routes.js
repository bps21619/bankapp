const bodyParser = require('body-parser');
const express = require('express');
const db = require('../models');
const controller = require('../controllers/auth.controller');
const verifyAccount = require('../middleware/verifyAccount');
const { getResetRequest } = require('../models/resetRequests');
const session = require('express-session');
const app = express();
let upload = require('../config/multer.config.js');
const bcrypt = require('bcryptjs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    key: "user_sid",
    secret: "somerandonstuffs",
    resave: false,
    saveUninitialized: true

}));
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Headers', "x-access-token, Origin, Content-Type, Accept");
    next();
});
app.get('/', controller.getIndex);
app.post('/home', [verifyAccount.checkDuplicateUser, verifyAccount.checkDuplicateEmail], controller.signup);
app.post('/yourDashboard', controller.signIn);
app.get('/login', controller.getIndex);
app.get('/accountDetailS/:user', (req, res) => {
    console.log('req====' + req.params.user);
    db.user.findOne({
        where: {
            username: req.params.user
        }
    }).then(user => {
        res.send(user);
    });
});
app.get('/accountDetails', controller.accountDetails);
app.get('/viewedituser/:user2', controller.getEditUser);
app.get('/deleteUser/:user1', controller.DeleteUser);
app.post('/sendMoney/:number', controller.sendMoney);
app.post('/editAccount', controller.postEditUser);
app.get('/download', controller.downloadFile);
app.get('/downloadPDF', controller.getpdfgenerator);
app.get('/admin', (req, res) => { res.render('adminIndex'); });
app.post('/accountBalance/:user', controller.withdraw);
app.post('/accountAddBalance/:user', controller.deposit);
app.post('/upload', upload.single("file"), controller.uploadFile);
app.get('/accountDetails/:user', controller.accountDetails);
app.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }

    });
});
app.post('/forgotPassword', controller.sendMail);
app.get("/reset/:id", (req, res, next) => {
    console.log('id=====' + req.params.id);
    const thisRequest = getResetRequest(req.params.id);
    console.log(thisRequest);
    if (thisRequest) {
        res.render('resetPassword', {
            email: thisRequest.email
        });
        next();
        app.post('/resetPassword', (req, res) => {
            if (req.body.newPassword === req.body.confirmPassword) {
                db.user.update({
                    password: bcrypt.hashSync(req.body.newPassword)
                }, { where: { email: thisRequest.email } });
                res.redirect('/');
            }
        });
    } else {
        res.status(404).send(err.message);
    }

});
module.exports = app;
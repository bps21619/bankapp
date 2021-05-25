const db = require('../models');
const TYPES = db.TYPES;
const User = db.user;
const Op = db.Sequelize.Op;
checkDuplicateUser = (req, res, next) => {
    if (req.body.mail === '') {
        res.send('enter email');
        return;
    }
    if (req.body.address === '') {
        res.send('enter address');
        return;
    }
    if (req.body.phone_number === '') {
        res.send('enter phone number');
        return;
    }
    // Username
    User.findOne({
        where: {
            username: req.body.name1
        }
    }).then(user => {
        if (user) {
            res.status(400).send({
                message: "username is already registered"
            });
            return;
        }
        //phone number
        User.findOne({
            where: {
                phone_number: req.body.phone
            }
        }).then(user => {
            if (user) {
                res.status(400).send({
                    message: "Your number is already registered"
                });
                return;
            }
            next();
        });
    });

};
checkDuplicateEmail = (req, res, next) => {
    User.findOne({
        where: {
            email: req.body.mail
        }
    }).then(user => {
        if (user) {
            res.status(400).send({
                message: 'your mail is already registered'
            });
            return;
        }
        next();
    });
};


const verifyAccount = {
    checkDuplicateUser: checkDuplicateUser,
    checkDuplicateEmail: checkDuplicateEmail

};

module.exports = verifyAccount;
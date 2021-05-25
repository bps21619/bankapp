module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define('users', {
        username: {
            type: Sequelize.STRING,
        },
        password: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        address: {
            type: Sequelize.STRING
        },
        phone_number: {
            type: Sequelize.STRING
        },
        accountType: {
            type: Sequelize.STRING
        },
        balance: {
            type: Sequelize.INTEGER,
            defaultValue: 1000
        }
    });
    return User;
};
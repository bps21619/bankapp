module.exports = (sequelize, Sequelize) => {
    const Type = sequelize.define("accountTypes", {
        accountType: {
            type: Sequelize.STRING
        }
    });
    return Type;
};
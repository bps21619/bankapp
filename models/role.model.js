module.exports = (sequelize, Sequelize) => {
    const Role = sequelize.define("Roles", {
        roleType: {
            type: Sequelize.STRING
        }
    });
    return Role;
};
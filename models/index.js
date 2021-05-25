const config = require('../config/db.config.js');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    config.db,
    config.user,
    config.password, {
        host: config.host,
        dialect: config.dialect,
        operatorAliases: false,
        pool: {
            max: config.pool.max,
            min: config.pool.min,
            acquire: config.pool.acquire,
            idle: config.pool.idle
        }
    }
);
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.user = require('./user.model.js')(sequelize, Sequelize);
db.accountType = require('./accountType.model.js')(sequelize, Sequelize);
db.role = require('./role.model')(sequelize, Sequelize);
db.accountType.belongsToMany(db.user, {
    through: 'user_account',

});
db.user.belongsToMany(db.accountType, {
    through: 'user_account',

});
db.role.hasMany(db.user, {});
db.user.belongsTo(db.role, {});
db.TYPES = ['Zero balance', 'Minimum balance'];
module.exports = db;
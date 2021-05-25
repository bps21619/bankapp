module.exports = {
    host: 'localhost',
    user: 'root',
    password: 'purna',
    db: 'bps',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 3000,
        idle: 10000
    }
};
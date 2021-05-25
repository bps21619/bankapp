const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const port = 4000;
const routes = require('./routes/auth.routes');
const cookieParser = require("cookie-parser");
const session = require('express-session');

const app = express();
global.__basedir = __dirname;


app.set('view engine', 'ejs');
const flash = require('connect-flash');
app.use(flash());

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));



const db = require('./models');
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "library api",
            version: "1.0.0",
            description: "Simple express library api"
        },
        servers: [{
            url: "http://localhost:4010",
        }],
    },
    apis: ['*.js']

};
const specs = swaggerJsDoc(options);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs, { explorer: true }));


app.use('/', routes);
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - username
 *         - password
 *         - address
 *         - phone_number
 *         - accountType
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         username:
 *           type: string
 *           description: The name of user
 *         password:
 *           type: string
 *           description: password of user
 *         address:
 *           type: string
 *           description: The name of user
 *         phone_number:
 *           type: string
 *           description: The mobile number of user
 *         accountType:
 *           type: string
 *           description: The account type  of user  
 *       example:
 *         id: 1
 *         username: syam prasad
 *         password: 123
 *         address: Hyderabad
 *         phone_number: 9966757734
 *         accountType: zero balance
 */

/**
 * @swagger
 * tags:
 *   name: User
 *   description: The user managing API
 */


/**
 * @swagger
 * /accountDetailS/{user}:
 *   get:
 *     description: account details of user
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: user 
 *         description: Username to use for login.
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: login
 *         content:
 *              application/json:
 *               schema:
 *                  $ref: '#/components/schemas/User'
 */

app.db = db;
db.sequelize.sync().then(() => {
    initial();
});

app.use(session({
    key: "user_sid",
    secret: "somerandonstuffs",
    resave: false,
    saveUninitialized: true

}));





function initial() {
    db.accountType.findOrCreate({
        where: { accountType: 'Zero balance' }
    });
    db.accountType.findOrCreate({
        where: { accountType: 'Minimum balance' }
    });
    db.role.findOrCreate({
        where: { roleType: 'Admin' }
    });
    db.role.findOrCreate({
        where: { roleType: 'User' }
    });
}
app.listen(port, () => {
    console.log('Listening on port: ' + port);
});
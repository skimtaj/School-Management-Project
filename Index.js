require('dotenv').config();
const express = require('express')
const app = express();
const path = require('path')
const db = require('./DB');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');

app.use(cookieParser())

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

app.use(flash());
app.use((req, res, next) => { res.locals.messages = req.flash(); next(); });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'Public')));
app.set('view engine', 'ejs');

const bodyParser = require('body-parser');
app.use(bodyParser.json());


app.use('/', require('./routes/admin_routes'))


const PORT = process.env.PORT || 3000

app.listen(3000, () => {

    console.log('Server is runnng')

})
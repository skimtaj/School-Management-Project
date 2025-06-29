const express = require('express')
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser')
const db = require('./DB')

app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'Public')));
app.set('view engine', 'ejs');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const session = require('express-session');
const flash = require('connect-flash');

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}))

app.use(flash());
app.use((req, res, next) => { res.locals.messages = req.flash(); next(); });

app.use('/', require('./routes/admin_routes'));
app.use('/', require('./routes/user_routes'))


app.listen(3000, () => {
    console.log('Server is connected')
})
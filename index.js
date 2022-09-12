const express = require('express');
const session = require('express-session');
const flash =  require('connect-flash');
const passport = require('passport');
const User = require('./models/User');
const { create } = require("express-handlebars");
const csrf = require('csurf');
require('dotenv').config()
require('./database/db');


const app = express();

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    name: "secret-name-blablabla",
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, {id: user._id, userName: user.userName}));
passport.deserializeUser(async(user, done) => {
    const userDB = await User.findById(user.id);
    return done(null, {id: userDB._id, userName: userDB.userName});
});


const hbs = create({ //Para definir que la extension de los archivos.handlebar va a ser .hbs
    extname: ".hbs",
    partialsDir: ["views/components"],
});

app.engine(".hbs", hbs.engine); //Definir el motor de plantilla que se va a usar
app.set("view engine", ".hbs");
app.set("views", "./views");

//Middlewears

app.use(express.urlencoded({extended: true}));
app.use(csrf());
app.use((req, res, next) => { //middleware para mandar el token de forma global
    res.locals.csrfToken = req.csrfToken();
    res.locals.mensajes = req.flash("mensajes"); //mandar mensajes del flash de forma global
    next();
});
app.use("/", require("./routes/home")); 
app.use("/auth", require("./routes/auth"));
app.use(express.static(__dirname + "/public"));

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log('Servidor iniciado...');
});
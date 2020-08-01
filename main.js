const express = require('express');
const layouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const expressSession = require('express-session');
const cookieParser = require('cookie-parser');
const connectFlash = require('connect-flash');
const passport = require('passport');
const User = require('./models/user');
const router = require('./routes/index');


mongoose.Promise = global.Promise;

const dbstring = process.env.CONFETTIDB;
mongoose.connect(dbstring, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false});


const app = express();

app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs");
app.set("token", process.env.TOKEN || "recipeT0k3n");

app.use(express.static("public"));
app.use(express.urlencoded( {extended: false}));
app.use(express.json());
app.use(layouts);
app.use(methodOverride("_method", {methods: ["POST", "GET"]}));


app.use(cookieParser("secret_passcode")); //TO DO - change to env variable
app.use(expressSession({
    secret: "secret_passcode",
    cookie: {
        maxAge: 4000000
    },
    resave: false,
    saveUninitialized: false
}));


app.use(connectFlash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.flashMessages = req.flash();
    res.locals.loggedIn = req.isAuthenticated();
    res.locals.currentUser = req.user;
    next();
});


app.use("/", router);


app.listen(app.get("port"), () => {
    console.log(`Server is running at port ${app.get("port")} ...`);
});
if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}


// const campground = require('./models/campground');
// const { campgroundSchema,reviewSchema } = require('./schema.js');
// const catchAsync = require('./utils/catchAsync');
// const Campground = require('./models/campground');
// const Review = require('./models/review');


// console.log(process.env.SECRET)
const express = require('express');
const app = express();
const ejsMate = require('ejs-mate');
const path = require('path');
const Joi = require('joi');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const helmet = require("helmet") 
const mongoSanitize = require('express-mongo-sanitize');
const dbUrl = process.env.DB_URL

const MongoStore = require('connect-mongo');

mongoose.connect(dbUrl)
    .then(() => {
        console.log("Mongo Connection Open!!");
    })
    .catch(err => {
        console.log("Error caught in Mongo !!!");
        console.log(err);
    })
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});

store.on("error", function(e){
    console.log("SESSION STORE ERROR", e);
})

const sessionConfig = {
    store,  // store : store,
    name: 'session',
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use(helmet());

const scriptSrcUrls = [
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dlurq7obv/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://imgs.search.brave.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session()); // always below session(sessionConfig)

app.use(mongoSanitize());

passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/',userRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews',reviewRoutes);


// to include public directory
app.use(express.static(path.join(__dirname,'public')));

app.get('/', (req, res) => {
    res.render('home');
})


// app.get('/fakeUser', async (req,res) => {
//     const user = new User({
//         email: 'prabal9713@gmail.com',
//         username: 'prabal_parmar'
//     })
//     const newUser = await User.register(user, 'chicken'); // here chicken is password
//     res.send(newUser);
// })

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something Went Wrong'
    res.status(statusCode).render('error', { err });
})

app.listen(3000, (req, res) => {
    console.log("On port 3000");
})
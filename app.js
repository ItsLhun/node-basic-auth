const path = require('path');
const express = require('express');
const createError = require('http-errors');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const serveFavicon = require('serve-favicon');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo'); //exports directly MongoStore

const baseRouter = require('./routes/index');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(serveFavicon(path.join(__dirname, 'public/images', 'favicon.ico')));
app.use(
  sassMiddleware({
    src: path.join('styles'),
    dest: path.join(__dirname, 'public/styles'),
    prefix: '/styles',
    outputStyle:
      process.env.NODE_ENV === 'development' ? 'expanded' : 'compressed',
    force: process.env.NODE_ENV === 'development',
    sourceMap: process.env.NODE_ENV === 'development'
  })
);
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));

// I will only care if a user is authenticated or not from this point onwards, logging the request, providing the favicon, etc., is common.

app.use(
  expressSession({
    secret: 'asdqweasdqwe', // key used to encrypt our cookies, ideally an env variable. A hard to guess string. It's import this remains the same or we won't be able to validate the session.
    //process.env.SESSION_SECRET
    saveUninitialized: false, // unless we explicitely tell the application, no session is created. This is related to the req.session.user = user.
    cookie: {
      maxAge: 15 * 24 * 60 * 60 * 1000 // the number comes in milliseconds, we passed 15 days.
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 60 * 60 //time to live, number of seconds the session is kept alive
    })
  })
);

// This will create a new collection on the DB of session. However, we don't want to set a cookie eevrytime, only when the user has registered

app.use('/', baseRouter);

// Catch missing routes and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Catch all error handler
app.use((error, req, res, next) => {
  // Set error information, with stack only available in development
  res.locals.message = error.message;
  res.locals.error = req.app.get('env') === 'development' ? error : {};
  res.status(error.status || 500);
  res.render('error');
});

module.exports = app;

// user should be able to create an account, to remain signed in

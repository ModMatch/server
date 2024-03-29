var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
require('dotenv').config();
var passport = require("passport");
var jwtStrat  = require("./jwt")


var indexRouter = require('./routes/index');
var postRouter = require('./routes/post');
var userRouter = require('./routes/user');
var groupRouter = require('./routes/group');
var confirmedGroupRouter = require('./routes/confirmedgroup');
var notificationRouter = require('./routes/notification');

//Set up mongoose connection
var mongoose = require('mongoose');
mongoose.connect(process.env.DB_HOST, { useNewUrlParser: true , useUnifiedTopology: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
passport.use(jwtStrat);

app.use('/', indexRouter);
app.use("/posts", postRouter);
app.use('/users', userRouter);
app.use('/groups', groupRouter);
app.use('/confirmedgroups', confirmedGroupRouter);
app.use('/notifications', notificationRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

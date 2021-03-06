var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var exhbs = require('express-handlebars')
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var fileUpload = require('express-fileupload'); 

var db = require('./config/connection');
var session = require('express-session');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// engine setup to view the layouts from layout and partials folder
app.engine('hbs', exhbs.engine({extname:'hbs', defaultLayout: 'layout', layoutsDir:__dirname + '/views/layout', partialsDir:__dirname + '/views/partials/'}));

app.use(fileUpload({limits: { fileSize: 50 * 1024 * 1024 },})); //middleware for uploading files with or without limited size
app.use(session({secret:"Key",cookie:{maxAge:600000}}));        // Setting timed cookie sessions

db.connect((err) => {                   //show database connection to port status in console
  if(err) console.log("Connection Error"+err);
  else console.log("Database connected to port 27017");
});

app.use('/', userRouter);    //executes the user middleware when it received a reques with url that starts with the given path (user.js file from routes folder)
app.use('/admin', adminRouter);   //executes the admin middleware (admin.js file from routes folder) 

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

module.exports = app;  //tells Node.js which bit of code to export from a given file so other files are allowed to access the exported code

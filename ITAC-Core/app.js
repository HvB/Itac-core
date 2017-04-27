var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();


var cors = require("express-cors");
app.use(cors({allowedOrigins : ['*:*']}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//app.use(express.static('./public'));
//app.use(express.static('./node_modules'));
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, 'public')));
/*
app.use('/', function(req, res, next) { 
	res.header("Access-Control-Allow-Origin", "*"); 
	res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
	res.header("Access-Control-Allow-Headers", "Authorization, X-Requested-With, Content-Type"); 
	next(); }); 
*/
app.all('*', function(req, res, next) {
	   res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
		res.header("Access-Control-Allow-Headers", "Authorization, X-Requested-With, Content-Type"); 
	   next();
	});

app.use('/', routes);
app.use('/users', users);
app.use( '/collab/config', require( './routes/configcollab' )() );
app.use( '/collab/sessionconfig', require( './routes/configsession' )() );
app.use( '/collab', require( './routes/collab' )() );
app.use( '/collab/session/:name', require( './routes/session' )() );
app.use( '/collab/:idZC/espacetravail/:rang/:idZP/:port/:minmax', require( './routes/workspace' )() );
app.use( '/collab/preconfig/:numconfig', require( './routes/collab' )() );
app.use( '/morpion', require( './routes/morpion' )() );
app.use( '/domotique', require( './routes/domotique' )() );

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});



module.exports = app;

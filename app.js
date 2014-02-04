// Module dependencies.
var express = require('express');
var http = require('http');
var path = require('path');
var swig = require('swig');
var mongoose = require('mongoose');

// Routes
var routes = require('./routes');
var account = require('./routes/account');
var hero = require('./routes/hero');
var devil = require('./routes/devil');

// Utilities
var config = require('./config');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('cookie-for-hero-n-devil'));
app.use(express.bodyParser());
app.use(express.session());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  app.set('view cache', false);
  swig.setDefaults({ cache: false });
}

// Connect to mongodb
mongoose.connect('mongodb://localhost/heroNdevil');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('-- routes --');
  app.get('/', routes.index);

  // HERO
  app.get('/hero', hero.index);

  // DEVIL
  app.get('/devil', devil.index);

  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });
});
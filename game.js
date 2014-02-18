// Module dependencies.
var express = require('express');
var http = require('http');
var path = require('path');
var swig = require('swig');
var mongoose = require('mongoose');
var socketio = require('socket.io');

// Routes
var routes = require('./routes');
var account = require('./routes/account');
var player = require('./routes/player');
var hero = require('./routes/hero');
var devil = require('./routes/devil');
var admin = require('./routes/admin');

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

var checkLogin = function (req, res, next) {
  if ( !req.session.account_id ) {
    res.redirect('/login');
    return;
  }
  next();
};

var checkCurrentPlayer = function (req, res, next) {
  if ( !req.session.account_id ) {
    res.redirect('/login');
    return;
  }

  if ( !req.session.current_player_id ) {
    // req.session.redirect = req.path; // 리다이렉트 예시
    res.redirect('/player');
    return;
  }

  next();
};

// Connect to mongodb
mongoose.connect('mongodb://localhost/heroNdevil');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  // INDEX
  app.get('/', checkCurrentPlayer, routes.index);

  // ACOUNT
  app.get('/login', account.index);
  app.get('/logout', account.logout);
  app.get('/signup', account.signup);
  app.post('/login', account.login);
  app.post('/signup', account.create);

  // PLAYER
  app.get('/player', checkLogin, player.index);
  app.get('/player/select/:id', checkLogin, player.select);
  app.get('/player/create', checkLogin, player.create);
  app.post('/player/create', checkLogin, player.createPlayer);

  // HERO
  app.get('/hero', checkLogin, hero.index);

  // DEVIL
  app.get('/devil', checkCurrentPlayer, devil.index);
  app.get('/devil/select', checkCurrentPlayer, devil.select);
  app.get('/devil/select/:id', checkCurrentPlayer, devil.selectDevil);

  // DEVIL - GAME
  app.post('/devil/status', checkCurrentPlayer, devil.game.status);
  app.post('/devil/attack', checkCurrentPlayer, devil.game.attack);
  app.post('/devil/collect', checkCurrentPlayer, devil.game.collect);

  // DEVIL - MONSTER
  app.post('/devil/monster/purchase', checkCurrentPlayer, devil.monster.purchase);
  app.post('/devil/monster/delete', checkCurrentPlayer, devil.monster.delete);
  app.post('/devil/monster/buildup', checkCurrentPlayer, devil.monster.buildup);
  app.post('/devil/monster/position', checkCurrentPlayer, devil.monster.position);

  // ADMIN
  app.get('/admin', admin.index);

  // ADMIN - HERO
  app.get('/admin/hero', admin.hero.index);
  app.post('/admin/hero', admin.hero.create);
  app.get('/admin/hero/view/:id', admin.hero.view);
  app.get('/admin/hero/edit/:id', admin.hero.edit);
  app.post('/admin/hero/edit/:id', admin.hero.create);
  app.get('/admin/hero/delete/:id', admin.hero.delete);

  // ADMIN - DEVIL
  app.get('/admin/devil', admin.devil.index);
  app.post('/admin/devil', admin.devil.create);
  app.get('/admin/devil/view/:id', admin.devil.view);
  app.get('/admin/devil/edit/:id', admin.devil.edit);
  app.post('/admin/devil/edit/:id', admin.devil.create);
  app.get('/admin/devil/delete/:id', admin.devil.delete);
  app.get('/admin/devil/publish/:id', admin.devil.publish);

  // ADMIN - CITY
  app.get('/admin/city', admin.city.index);
  app.post('/admin/city', admin.city.create);
  app.get('/admin/city/view/:id', admin.city.view);
  app.get('/admin/city/edit/:id', admin.city.edit);
  // app.post('/admin/city/edit/:id', admin.city.create);
  app.get('/admin/city/delete/:id', admin.city.delete);
  app.get('/admin/city/apply', admin.city.apply);

  // ADMIN - MONSTER
  app.get('/admin/monster', admin.monster.index);
  app.post('/admin/monster', admin.monster.create);
  app.get('/admin/monster/view/:id', admin.monster.view);
  app.get('/admin/monster/edit/:id', admin.monster.edit);
  // app.post('/admin/monster/edit/:id', admin.monster.create);
  app.get('/admin/monster/delete/:id', admin.monster.delete);
  app.get('/admin/monster/publish/:id', admin.monster.publish);

  // ADMIN - SOLDIER
  app.get('/admin/soldier', admin.soldier.index);
  app.post('/admin/soldier', admin.soldier.create);
  app.get('/admin/soldier/view/:id', admin.soldier.view);
  app.get('/admin/soldier/edit/:id', admin.soldier.edit);
  // app.post('/admin/soldier/edit/:id', admin.soldier.create);
  app.get('/admin/soldier/delete/:id', admin.soldier.delete);
  app.get('/admin/soldier/publish/:id', admin.soldier.publish);


  var server = http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });

  var io = socketio.listen(server);
  io.sockets.on('connection', function (socket) {
    socket.on('attack', function (data) {
      console.log('data:', data);
      console.log('session:', socket);
    });
  });

});
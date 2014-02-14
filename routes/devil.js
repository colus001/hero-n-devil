//////////////////////////////////////////////////
//
//  grouple - devil.js
//
//  Purpose: Utliities
//  Created: 2013.12.03
//
//////////////////////////////////////////////////

// Module dependencies
var async = require('async');

// Model
var Hero = require('../lib/model').Hero;
var Devil = require('../lib/model').Devil;
var City = require('../lib/model').City;
var Player = require('../lib/model').Player;
var Monster = require('../lib/model').Monster;

// Model Prototype
var ProtoCity = require('../lib/model').ProtoCity;
var ProtoDevil = require('../lib/model').ProtoDevil;
var ProtoMonster = require('../lib/model').ProtoMonster;

// Library
var errorHandler = require('../lib/errorHandler');

exports.index = function (req, res) {
  var current_player_id = req.session.current_player_id;

  async.waterfall([
    function getPlayer (callback) {
      Player.findById(current_player_id, function (err, player) {
        if (err) throw err;

        if ( !player ) {
          console.log('NO_PLAYER_FOUND');
          callback('NO_PLAYER_FOUND');
          res.redirect('/player');
          return;
        }

        console.log('player:', player);
        callback(null, player);
        return;
      });
    },

    function getDevil (player, callback) {
      if ( !player.devil_id ) {
        res.redirect('/devil/select');
        callback('NO_DEVIL_ID_FOUND');
        return;
      }

      Devil.findById(player.devil_id, function (err, devil) {
        if (err) throw err;

        if ( !devil ) {
          res.redirect('/devil/select');
          callback('NO_DEVIL_FOUND');
          return;
        }

        console.log('devil:', devil);
        callback(null, player, devil);
        return;
      });
    },

    function getCities (player, devil, callback) {
      City.find({ 'player_id': current_player_id, 'isColony': false }, function (err, cities) {
        if (err) throw err;

        if ( !cities ) {
          errorHandler.sendErrorMessage('NO_CITIES_FOUND', res);
          return;
        }

        callback(null, player, devil, cities);
        return;
      });
    },

    function getColonies (player, devil, cities, callback) {
      City.find({ 'player_id': current_player_id, 'isColony': true }, function (err, colonies) {
        if (err) throw err;

        if ( !colonies ) {
          errorHandler.sendErrorMessage('NO_COLONIES_FOUND', res);
          return;
        }

        callback(null, player, devil, cities, colonies);
        return;
      });
    },

    function getMonsters (player, devil, cities, colonies, callback) {
      ProtoMonster.find({ /* 'player_id': current_player_id */ }, function (err, monsters) {
        if (err) throw err;

        if ( !monsters ) {
          errorHandler.sendErrorMessage('NO_MONSTERS_FOUND', res);
          return;
        }

        callback(null, player, devil, cities, colonies, monsters);
        return;
      });
    },

    function getResult (player, devil, cities, colonies, monsters, callback) {
      var result = {
        'result': 'success',
        'devil': devil,
        'cities': cities,
        'colonies': colonies,
        'monsters': monsters
      };

      callback(null, result);
      return;
    }
  ], function (err, result) {
    res.render('devil.index.html', result);
    return;
  });
};

exports.select = function (req, res) {
  async.waterfall([
    function getPlayerAndCheckDevil (callback) {
      Player.findById(req.session.current_player_id, function (err, player) {
        if (err) throw err;

        if ( !player ) {
          errorHandler.sendErrorMessage('NO_PLAYER_FOUND', res);
          return;
        }

        callback(null, player);
        return;
      });
    },

    function getDevil (player, callback) {
      Devil.findById(player.devil_id, function (err, devil) {
        if (err) throw err;

        if ( devil ) {
          res.redirect('/devil');
          return;
        }

        callback(null, player);
        return;
      });
    },

    function (player, callback) {
      ProtoDevil.find({}, function (err, devils) {
        if (err) throw err;

        if ( devils.length === 0 ) {
          errorHandler.sendErrorMessage('NO_DEVILS_FOUND', res);
          return;
        }

        var result = {
          'result': 'success',
          'devils': devils
        };

        callback(null, result);
        return;
      });
    }
  ], function (err, result) {
    res.render('devil.select.html', result);
    return;
  });
};

exports.selectDevil = function (req, res) {
  async.waterfall([
    function getPlayerAndCheckDevil (callback) {
      Player.findById(req.session.current_player_id, function (err, player) {
        if (err) throw err;

        if ( !player ) {
          errorHandler.sendErrorMessage('NO_PLAYER_FOUND', res);
          return;
        }

        callback(null, player);
        return;
      });
    },

    function checkDevil (player, callback) {
      Devil.findById(player.devil_id, function (err, devil) {
        if (err) throw err;

        if ( devil ) {
          res.redirect('/devil');
          return;
        }

        callback(null, player);
        return;
      });
    },

    function getCity (player, callback) {
      ProtoCity.find({}, function (err, protocities) {
        if (err) throw err;

        if ( protocities.length === 0 ) {
          errorHandler.sendErrorMessage('NO_PROTOTYPE_FOUND', res);
          return;
        }

        async.map(protocities, function (protocity, next) {
          var city = JSON.parse(JSON.stringify(protocity));
          city.player_id = player._id;

          delete city.created_at;
          delete city.updated_at;
          delete city._id;

          City(city).save(function (err, city) {
            if (err) throw err;

            next(null, protocity);
            return;
          });
        }, function (err, results) {
          callback(null, player);
          return;
        });
      });
    },

    function getDevil (player, callback) {
      ProtoDevil.findById(req.params.id, function (err, protodevil) {
        if (err) throw err;

        if ( !protodevil ) {
          errorHandler.sendErrorMessage('NO_DEVIL_FOUND', res);
          return;
        }

        var devil = JSON.parse(JSON.stringify(protodevil));

        devil.player_id = player._id;
        devil.current_health_point = devil.health_point;

        delete devil.created_at;
        delete devil.updated_at;
        delete devil._id;

        console.log('devil:', devil);

        Devil(devil).save(function (err, devil) {
          if (err) throw err;

          callback(null, devil);
          return;
        });
      });
    },

    function updateDevilId (devil, callback) {
      Player.findByIdAndUpdate(req.session.current_player_id, { 'devil_id': devil._id }, function (err, player) {
        if (err) throw err;

        if ( !player ) {
          errorHandler.sendErrorMessage('NO_PLAYER_FOUND', res);
          return;
        }

        callback(null);
        return;
      });
    },
  ], function (err, result) {
    res.redirect('/devil');
    return;
  });
};

exports.game = require('./devil.game');